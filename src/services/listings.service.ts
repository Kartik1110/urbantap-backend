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
  RequestStatus,
  Quarter,
  Type_of_use,
  DealType,
  CurrentStatus,
  Views,
  Market
} from "@prisma/client";
import { sendPushNotificationToTopic } from "./firebase.service";
import generateListingFromText from "../scripts/generate-listings";

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
            email: true,
            linkedin_link: true,
            ig_link: true,
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
        email: broker.email,
        linkedin_link: broker.linkedin_link,
        ig_link: broker.ig_link,
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
    handover_year?: number[];
    handover_quarter?: Quarter[];
    type_of_use?: Type_of_use[];
    deal_type?: DealType[];
    current_status?: CurrentStatus[];
    views?: Views[];
    market?: Market[];
    parking_space?: boolean;
    service_charge?: number;
    construction_progress?: number;
    gfa_bua?: number;
    floor_area_ratio?: number;
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
      handover_year,
      handover_quarter,
      type_of_use,
      deal_type,
      current_status,
      views,
      market,
      ...restFilters
    } = filterParams;

    // Calculate skip value for pagination
    const skip = (page - 1) * page_size;
    console.log("filterParams.type", type);
    // Base WHERE condition with admin_status
    const whereCondition = {
      AND: [
        { admin_status: Admin_Status.Approved },
        {
          broker: {
            sentToConnectionRequests: {
              none: {
                status: RequestStatus.Blocked,
              },
            },
          },
        },
        // Add specific filters one by one
        ...(looking_for !== undefined ? [{ looking_for }] : []),
        ...(category ? [{ category }] : []),
        ...(city ? [{ city }] : []),
        ...(address
          ? [{ address: { contains: address, mode: "insensitive" } }]
          : []),
        ...(handover_year?.length ? [{ handover_year: { in: handover_year } }] : []),
        ...(handover_quarter?.length ? [{ handover_quarter: { in: handover_quarter } }] : []),
        ...(type_of_use?.length ? [{ type_of_use: { in: type_of_use } }] : []),
        ...(deal_type?.length ? [{ deal_type: { in: deal_type } }] : []),
        ...(current_status?.length ? [{ current_status: { in: current_status } }] : []),
        ...(views?.length ? [{ views: { in: views } }] : []),
        ...(market?.length ? [{ market: { in: market } }] : []),
        ...(filters.parking_space !== undefined ? [{ parking_space: filters.parking_space }] : []),
        ...(filters.service_charge !== undefined ? [{ service_charge: filters.service_charge }] : []),
        ...(filters.construction_progress !== undefined ? [{ construction_progress: filters.construction_progress }] : []),
        ...(filters.gfa_bua !== undefined ? [{ gfa_bua: filters.gfa_bua }] : []),
        ...(filters.floor_area_ratio !== undefined ? [{ floor_area_ratio: filters.floor_area_ratio }] : []),

        // Price range condition
        ...(min_price || max_price
          ? [
              {
                AND: [
                  ...(min_price ? [{ min_price: { gte: min_price } }] : []),
                  ...(max_price ? [{ max_price: { lte: max_price } }] : []),
                ],
              },
            ]
          : []),

        // Square footage condition
        ...(min_sqft || max_sqft
          ? [
              {
                sq_ft: {
                  ...(min_sqft && { gte: min_sqft }),
                  ...(max_sqft && { lte: max_sqft }),
                },
              },
            ]
          : []),

        // Array filters
        ...(no_of_bathrooms?.length
          ? [{ no_of_bathrooms: { in: no_of_bathrooms } }]
          : []),

        ...(no_of_bedrooms?.length
          ? [{ no_of_bedrooms: { in: no_of_bedrooms } }]
          : []),
        ...(furnished?.length ? [{ furnished: { in: furnished } }] : []),
        ...(type?.length ? [{ type: { in: type } }] : []),
        ...(rental_frequency?.length
          ? [{ rental_frequency: { in: rental_frequency } }]
          : []),
        ...(project_age?.length ? [{ project_age: { in: project_age } }] : []),
        ...(payment_plan?.length
          ? [{ payment_plan: { in: payment_plan } }]
          : []),
        ...(sale_type?.length ? [{ sale_type: { in: sale_type } }] : []),
        ...(amenities?.length ? [{ amenities: { hasSome: amenities } }] : []),

        // Add any remaining filters
        ...Object.entries(restFilters).map(([key, value]) => ({
          [key]: value,
        })),
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

/* Bulk insert listings */
export const bulkInsertListingsService = async (listings: Listing[]) => {
  try {
    const listingsWithPendingStatus = listings.map((listing) => ({
      ...listing,
      admin_status: Admin_Status.Pending,
    }));

    const newListings = await prisma.listing.create({
      data: listingsWithPendingStatus[0],
    });

    /* Send push notification to every one that a new listing has been posted by a broker */
    // const brokers = await prisma.broker.findMany();

    // brokers.forEach(async (broker) => {
    //   const notification = await prisma.notification.create({
    //     data: {
    //       broker_id: broker.id,
    //       type: NotificationType.General,
    //       sent_by_id: "",
    //       text: "",
    //       message: `A new listing has been posted by a broker`,
    //     },
    //   });

    //   if (notification) {
    //     if (broker.user_id) {
    //       const user = await prisma.user.findUnique({
    //         where: {
    //           id: broker.user_id,
    //         },
    //       });

    //       if (user && user.fcm_token) {
    //         await sendPushNotificationToTopic({
    //           title: "New Listing Posted",
    //           body: "A new listing has been posted by a broker",
    //           topic: "new-listings",
    //         });
    //       }
    //     }
    //   }
    // });

    return newListings;
  } catch (error) {
    console.error(error);
    logger.error(error);
    throw error;
  }
};

export const editListingService = async (
  listingId: string,
  updates: Partial<Listing>
) => {
  try {
    const existing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!existing) throw new Error("Listing not found");

    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        ...updates,
        admin_status: Admin_Status.Pending, // Optional: reset status after edit
      },
    });

    return updatedListing;
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
export const reportListingService = async (
  listingId: string,
  reason: string,
  description: string,
  brokerId: string
) => {
  try {
    const reportedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        admin_status: Admin_Status.Reported,
      },
    });

    /* Create reported listing */
    await prisma.reportedListing.create({
      data: {
        listing_id: listingId,
        reported_by_id: brokerId,
        reason: reason,
        description: description,
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
          text: `Your listing has been reported for violating our community guidelines and is currently under review.`,
          message: "", // kept empty as it is a system generated notification
          listing_id: listingId,
        },
      });
    }

    return reportedListing;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

// Generate Listing from Text Service
export const generateListingFromTextService = async (text: string) => {
  try {
    return await generateListingFromText(text);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
