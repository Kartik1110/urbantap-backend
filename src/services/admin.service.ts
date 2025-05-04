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
    page?: number;
    page_size?: number;
  } & ListingFilters
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
    const { page = 1, page_size = 10, ...filterParams } = filters;

    // Remove these properties from filterParams before constructing whereCondition
    const {
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
    } = filterParams;

    // Calculate skip value for pagination
    const skip = (page - 1) * page_size;

    console.log('filterParams.type', type);

    // Base WHERE condition with admin_status
    const whereCondition = {
      AND: [
        { admin_status: Admin_Status.Pending },
        {
          broker: {
            sentToConnectionRequests: {
              none: {
                status: RequestStatus.Blocked
              }
            }
          }
        },
        // Add specific filters one by one
        ...(looking_for !== undefined ? [{ looking_for }] : []),
        ...(category ? [{ category }] : []),
        ...(city ? [{ city }] : []),
        ...(address ? [{ address }] : []),

        // Price range condition
        ...(min_price || max_price
          ? [{
              AND: [
                ...(min_price ? [{ min_price: { gte: min_price } }] : []),
                ...(max_price ? [{ max_price: { lte: max_price } }] : []),
              ],
            }]
          : []),

        // Square footage condition
        ...(min_sqft || max_sqft
          ? [{
              sq_ft: {
                ...(min_sqft && { gte: min_sqft }),
                ...(max_sqft && { lte: max_sqft }),
              },
            }]
          : []),

        // Array filters
        ...(no_of_bathrooms?.length ? [{ no_of_bathrooms: { in: no_of_bathrooms } }] : []),
        ...(no_of_bedrooms?.length ? [{ no_of_bedrooms: { in: no_of_bedrooms } }] : []),
        ...(furnished?.length ? [{ furnished: { in: furnished } }] : []),
        ...(type?.length ? [{ type: { in: type } }] : []),
        ...(rental_frequency?.length ? [{ rental_frequency: { in: rental_frequency } }] : []),
        ...(project_age?.length ? [{ project_age: { in: project_age } }] : []),
        ...(payment_plan?.length ? [{ payment_plan: { in: payment_plan } }] : []),
        ...(sale_type?.length ? [{ sale_type: { in: sale_type } }] : []),
        ...(amenities?.length ? [{ amenities: { hasSome: amenities } }] : []),

        // Add any remaining filters
        ...Object.entries(restFilters).map(([key, value]) => ({ [key]: value })),
      ].filter(Boolean),
    };

    // Remove the filterParams from being spread directly into the AND array
    delete filterParams.page;
    delete filterParams.page_size;

    // Get total count for pagination
    const total = await prisma.listing.count({
      where: whereCondition,
    });

    const listings = await prisma.listing.findMany({
      where: whereCondition,
      skip,
      take: page_size,
      orderBy: {
        created_at: "desc",
      },
      include: {
        broker: {
          select: {
            id: true,
            name: true,
            profile_pic: true,
            country_code: true,
            w_number: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (listings.length === 0) {
      return {
        listings: [
          {
            listing: {},
            broker: {
              id: "",
              name: "",
              profile_pic: "",
              country_code: "",
              w_number: "",
            },
            company: { name: "" },
          },
        ],
        pagination: {
          total: 0,
          page,
          page_size,
          total_pages: 0,
        },
      };
    }

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
      listings: formattedListings,
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

    const notifications = otherBrokers
      .filter((broker) => broker.user?.fcm_token)
      .map((broker) => ({
        token: broker.user!.fcm_token!,
        title: "New Listing Alert",
        body: `${updatedListing.broker?.name || "A broker"} has posted a new listing`,
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
            text: `${updatedListing.broker?.name || "A broker"} has posted a new listing`,
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

