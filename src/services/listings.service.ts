import logger from "../utils/logger";
import prisma from "../utils/prisma";
import {
  Listing,
  Admin_Status,
  NotificationType,
  City,
  Bathrooms,
  Bedrooms,
  Furnished,
  Type,
  Rental_frequency,
} from "@prisma/client";
import { sendPushNotification } from "./firebase.service";

/* Get listings */
interface ListingFilters {
  [key: string]: any; // TODO: Define the type of filters
}

export const getListingByIdService = async (id: string) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
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

    if (!listing) {
      return {
        listing: {},
        broker: {
          id: "",
          name: "",
          profile_pic: "",
          country_code: "",
          w_number: "",
        },
        company: { name: "" },
      };
    }

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
  } catch (error) {
    console.error(error);
    logger.error(error);
    throw error;
  }
};

export const getListingsService = async (
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

    // Calculate skip value for pagination
    const skip = (page - 1) * page_size;

    // Base WHERE condition with admin_status
    const whereCondition = {
      AND: [
        { admin_status: Admin_Status.Approved },
        // Base filters as AND conditions
        ...(Object.keys(filterParams).length > 0 ? [filterParams as any] : []),
        ...(filterParams.looking_for !== undefined
          ? [{ looking_for: filterParams.looking_for }]
          : []),
        ...(filterParams.category ? [{ category: filterParams.category }] : []),
        ...(filterParams.city ? [{ city: filterParams.city }] : []),
        ...(filterParams.address ? [{ address: filterParams.address }] : []),

        // Price range condition
        ...(filterParams.min_price || filterParams.max_price
          ? [
              {
                AND: [
                  ...(filterParams.min_price
                    ? [{ min_price: { gte: filterParams.min_price } }]
                    : []),
                  ...(filterParams.max_price
                    ? [{ max_price: { lte: filterParams.max_price } }]
                    : []),
                ],
              },
            ]
          : []),

        // Square footage condition
        ...(filterParams.min_sqft || filterParams.max_sqft
          ? [
              {
                sq_ft: {
                  ...(filterParams.min_sqft && { gte: filterParams.min_sqft }),
                  ...(filterParams.max_sqft && { lte: filterParams.max_sqft }),
                },
              },
            ]
          : []),

        // Array filters as OR conditions within their groups
        ...(filterParams.no_of_bathrooms
          ? [{ no_of_bathrooms: { in: filterParams.no_of_bathrooms } }]
          : []),
        ...(filterParams.no_of_bedrooms
          ? [{ no_of_bedrooms: { in: filterParams.no_of_bedrooms } }]
          : []),
        ...(filterParams.furnished
          ? [{ furnished: { in: filterParams.furnished } }]
          : []),
        ...(filterParams.type ? [{ type: { in: filterParams.type } }] : []),
        ...(filterParams.rental_frequency
          ? [{ rental_frequency: { in: filterParams.rental_frequency } }]
          : []),
        ...(filterParams.project_age
          ? [{ project_age: { in: filterParams.project_age } }]
          : []),
        ...(filterParams.payment_plan
          ? [{ payment_plan: { in: filterParams.payment_plan } }]
          : []),
        ...(filterParams.sale_type
          ? [{ sale_type: { in: filterParams.sale_type } }]
          : []),
        ...(filterParams.amenities
          ? [{ amenities: { hasSome: filterParams.amenities } }]
          : []),
      ],
    };

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

/* Bulk insert listings */
export const bulkInsertListingsService = async (listings: Listing[]) => {
  try {
    const listingsWithPendingStatus = listings.map((listing) => ({
      ...listing,
      admin_status: Admin_Status.Pending,
    }));

    const newListings = await prisma.listing.createMany({
      data: listingsWithPendingStatus,
    });

    /* Send push notification to every one that a new listing has been posted by a broker */
    const brokers = await prisma.broker.findMany();

    brokers.forEach(async (broker) => {
      const notification = await prisma.notification.create({
        data: {
          broker_id: broker.id,
          type: NotificationType.General,
          sent_by_id: "",
          text: "",
          message: `A new listing has been posted by a broker`,
        },
      });

      if (notification) {
        if (broker.user_id) {
          const user = await prisma.user.findUnique({
            where: {
              id: broker.user_id,
            },
          });

          if (user && user.fcm_token) {
            await sendPushNotification({
              title: "New Listing Posted",
              body: "A new listing has been posted by a broker",
              token: user.fcm_token,
            });
          }
        }
      }
    });

    return newListings;
  } catch (error) {
    console.error(error);
    logger.error(error);
    throw error;
  }
};

/*Delete Listing by Id */
export const deleteListingbyId = async (listingId: string) => {
  try {
    const deletedListing = await prisma.listing.delete({
      where: {
        id: listingId,
      },
    });

    return deletedListing;
  } catch (error) {
    console.error(error);
    logger.error(error);
    throw error;
  }
};

/* Report Listing */
export const reportListingService = async (listingId: string) => {
  try {
    const reportedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        admin_status: Admin_Status.Reported,
      },
    });

    /* Create notification for broker of the listing */
    const broker = await prisma.broker.findUnique({
      where: { id: reportedListing.broker_id },
    });

    if (broker) {
      await prisma.notification.create({
        data: {
          broker_id: broker.id,
          type: NotificationType.General,
          sent_by_id: "", // kept empty as it is a system generated notification
          text: "", // kept empty as it is a system generated notification
          message: `Your listing has been reported for violating our community guidelines and is currently under review.`,
        },
      });
    }

    return reportedListing;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
