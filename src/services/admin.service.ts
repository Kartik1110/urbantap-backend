import logger from "../utils/logger";
import prisma from "../utils/prisma";
import {  NotificationType } from "@prisma/client";
import { sendPushNotification, sendMulticastPushNotification } from "./firebase.service";
import {
  Listing,
  Admin_Status,
  City,
  Bathrooms,
  Bedrooms,
  Furnished,
  Type,
  Rental_frequency,
  RequestStatus,
} from "@prisma/client";

interface ListingFilters {
  [key: string]: any;
}



export const getAdminListingsService = async (
  filters: {
    looking_for?: boolean;
    category?: "Ready_to_move" | "Off_plan" | "Rent";
    min_price?: number;
    max_price?: number;
    min_sqft?: number;
    max_sqft?: number;
    city?: City;
    address?: string;
    no_of_bathrooms?: Bathrooms[];
    no_of_bedrooms?: Bedrooms[];
    furnished?: Furnished[];
    type?: Type[];
    rental_frequency?: Rental_frequency[];
    project_age?: ("Less_than_5_years" | "More_than_5_years")[];
    payment_plan?: ("Payment_done" | "Payment_Pending")[];
    sale_type?: ("Direct" | "Resale")[];
    amenities?: string[];
    admin_status?: ("Approved" | "Rejected" | "Pending" | "Reported")[];
    page?: number;
    page_size?: number;
  }
): Promise<{
  listings: Array<{
    listing: Partial<Listing>;
    broker: {
      id: string;
      name: string;
      profile_pic: string;
      country_code: string;
      w_number: string;
    };
    company: {
      name: string;
    };
  }>;
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}> => {
  try {
    const {
      page = 1,
      page_size = 10,
      admin_status,
      type,
      no_of_bathrooms,
      no_of_bedrooms,
      furnished,
      rental_frequency,
      project_age,
      payment_plan,
      sale_type,
      amenities,
      min_price,
      max_price,
      min_sqft,
      max_sqft,
      looking_for,
      category,
      city,
      address,
      ...restFilters
    } = filters;

    const skip = (page - 1) * page_size;

    const whereCondition = {
      AND: [
        // Optional: Admin status filter
        ...(admin_status?.length ? [{ admin_status: { in: admin_status } }] : []),

        // Blocked broker filtering
        {
          broker: {
            sentToConnectionRequests: {
              none: {
                status: RequestStatus.Blocked,
              },
            },
          },
        },

        ...(looking_for !== undefined ? [{ looking_for }] : []),
        ...(category ? [{ category }] : []),
        ...(city ? [{ city }] : []),
        ...(address ? [{ address }] : []),

        ...(min_price || max_price
          ? [{
              AND: [
                ...(min_price ? [{ min_price: { gte: min_price } }] : []),
                ...(max_price ? [{ max_price: { lte: max_price } }] : []),
              ],
            }]
          : []),

        ...(min_sqft || max_sqft
          ? [{
              sq_ft: {
                ...(min_sqft && { gte: min_sqft }),
                ...(max_sqft && { lte: max_sqft }),
              },
            }]
          : []),

        ...(no_of_bathrooms?.length ? [{ no_of_bathrooms: { in: no_of_bathrooms } }] : []),
        ...(no_of_bedrooms?.length ? [{ no_of_bedrooms: { in: no_of_bedrooms } }] : []),
        ...(furnished?.length ? [{ furnished: { in: furnished } }] : []),
        ...(type?.length ? [{ type: { in: type } }] : []),
        ...(rental_frequency?.length ? [{ rental_frequency: { in: rental_frequency } }] : []),
        ...(project_age?.length ? [{ project_age: { in: project_age } }] : []),
        ...(payment_plan?.length ? [{ payment_plan: { in: payment_plan } }] : []),
        ...(sale_type?.length ? [{ sale_type: { in: sale_type } }] : []),
        ...(amenities?.length ? [{ amenities: { hasSome: amenities } }] : []),

        // Dynamic filters from query
        ...Object.entries(restFilters).map(([key, value]) => ({ [key]: value })),
      ],
    };

    const total = await prisma.listing.count({ where: whereCondition });

    const listings = await prisma.listing.findMany({
      where: whereCondition,
      skip,
      take: page_size,
      orderBy: { created_at: "desc" },
      include: {
        broker: {
          select: {
            id: true,
            name: true,
            profile_pic: true,
            country_code: true,
            w_number: true,
            company: {
              select: { name: true },
            },
          },
        },
      },
    });

    const formattedListings = listings.map((listing: any) => {
      const { broker, ...listingWithoutBroker } = listing;
      return {
        listing: listingWithoutBroker,
        broker: {
          id: broker.id,
          name: broker.name,
          profile_pic: broker.profile_pic,
          country_code: broker.country_code,
          w_number: broker.w_number,
        },
        company: {
          name: broker.company?.name || "",
        },
      };
    });

    return {
      listings: formattedListings.length ? formattedListings : [{
        listing: {},
        broker: {
          id: "",
          name: "",
          profile_pic: "",
          country_code: "",
          w_number: "",
        },
        company: { name: "" },
      }],
      pagination: {
        total,
        page,
        page_size,
        total_pages: Math.ceil(total / page_size),
      },
    };
  } catch (error) {
    console.error(error);
    logger.error(error);
    throw error;
  }
};


export const updateListingStatusService = async (id: string, status: string) => {
  const validStatuses = Object.keys(Admin_Status);
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid status value");
  }

  // Update the listing
  const updatedListing = await prisma.listing.update({
    where: { id },
    data: {
      admin_status: Admin_Status[status as keyof typeof Admin_Status],
    },
    include: {
      broker: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!updatedListing) {
    throw new Error("Listing not found");
  }

  console.log("✅ Listing updated:", updatedListing.id);

  // Notify the listing owner
  const brokerUser = updatedListing.broker?.user;
  if (brokerUser?.fcm_token) {
    const title = status === "Approved" ? "Listing Approved" : "Listing Rejected";
    const body = status === "Approved"
      ? "Your listing has been approved"
      : "Your listing has been rejected";

    try {
      const pushResponse = await sendPushNotification({
        token: brokerUser.fcm_token,
        title,
        body,
        data: {
          listingId: updatedListing.id,
          type: status === "Approved" ? "LISTING_APPROVAL" : "LISTING_REJECTION",
        },
      });
      console.log("✅ Notification sent to listing owner:", brokerUser.id, pushResponse);
    } catch (error) {
      console.error("❌ Failed to send notification to broker user:", brokerUser.id, error);
    }
  } else {
    console.warn("⚠️ No FCM token found for listing owner:", brokerUser?.id);
  }

  // Notify other brokers if listing is approved
  if (status === "Approved") {
    const otherBrokers = await prisma.broker.findMany({
      where: {
        NOT: {
          id: updatedListing.broker_id,
        },
      },
      include: {
        user: true,
      },
    });

    console.log("📢 Found other brokers to notify:", otherBrokers.length);

    const firstName = updatedListing.broker?.user?.name || 'Someone';
    const listingType = updatedListing.sale_type?.toLowerCase() || 'property';
    const location =  updatedListing.address || updatedListing.city || 'a location';

    const multicastBody = `${firstName} just listed a ${listingType} space in ${location}! Check it out before someone else grabs it!`;
    const multicastTitle = "New Listing Alert";
    const multicastText = `${multicastTitle}: ${multicastBody}`;
  
    const notifications = otherBrokers
      .filter((broker) => broker.user?.fcm_token)
      .map((broker) => ({
        token: broker.user!.fcm_token!,
        title: multicastTitle,
        body: multicastBody,
        data: {
          listingId: updatedListing.id,
          type: "NEW_LISTING_ALERT",
        },
      }));

    if (notifications.length > 0) {
      try {
        await sendMulticastPushNotification(notifications);
        console.log("✅ Multicast push sent.");
      } catch (error) {
        console.error("❌ Error sending multicast notification:", error);
      }
    } else {
      console.warn("⚠️ No valid FCM tokens found for other brokers.");
    }

    await Promise.all(
      otherBrokers.map((broker) =>
        prisma.notification.create({
          data: {
            broker_id: broker.id,
            sent_by_id: updatedListing.broker_id,
            text: multicastText,
            type: NotificationType.General,
            listing_id: updatedListing.id,
          },
        })
      )
    );
    console.log("✅ Notifications saved to DB for all other brokers.");
  }

  return updatedListing;
};

export const getUserListService = async ({
  page,
  page_size,
  token,
  search,
  searchType,
  startDate,
  endDate
}: {
  page: number;
  page_size: number;
  token: string;
  search?: string;
  searchType?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  const offset = (page - 1) * page_size;

  const whereClause: any = {};

  // --- Search logic ---
  if (search && searchType) {
    switch (searchType) {
      case "id":
        whereClause.id = search;
        break;
      case "email":
        whereClause.email = {
          contains: search,
          mode: "insensitive",
        };
        break;
      case "name":
        whereClause.name = {
          contains: search,
          mode: "insensitive",
        };
        break;
      case "w_number":
        whereClause.w_number = {
          contains: search,
          mode: "insensitive",
        };
        break;
    }
  }

  // --- Date filtering logic ---
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    whereClause.createdAt = {
      gte: new Date(start.setHours(0, 0, 0, 0)),
      lte: new Date(end.setHours(23, 59, 59, 999)),
    };
  } else if (startDate) {
    const start = new Date(startDate);
    whereClause.createdAt = {
      gte: new Date(start.setHours(0, 0, 0, 0)),
      lte: new Date(start.setHours(23, 59, 59, 999)),
    };
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    skip: offset,
    take: page_size,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.user.count({
    where: whereClause,
  });

  return {
    users,
    pagination: {
      total,
      page,
      page_size,
      total_pages: Math.ceil(total / page_size),
    },
  };
};