import prisma from "../utils/prisma";
import { Listing } from "@prisma/client";
import { ListingFilters, CreateListingInput } from '../schemas/listing.schema';

/* Get listings */
export const getListingsService = async (filters: ListingFilters) => {
  try {
    const { min_price, max_price, min_sqft, max_sqft, ...otherFilters } =
      filters;

    const listings = await prisma.listing.findMany({
      where: {
        ...otherFilters,
        AND: [
          {
            OR: [
              {
                min_price: min_price ? {
                  gte: min_price,
                } : undefined,
                max_price: max_price ? {
                  lte: max_price,
                } : undefined,
              },
            ],
          },
          {
            sq_ft: {
              ...(min_sqft && { gte: min_sqft }),
              ...(max_sqft && { lte: max_sqft }),
            },
          },
        ].filter(Boolean),
      },
      include: {
        broker: {
          select: {
            id: true,
            name: true,
            profile_pic: true,
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
      return [
        {
          listing: {},
          broker: { id: "", name: "", profile_pic: "" },
          company: { name: "" },
        },
      ];
    }

    return listings.map((listing) => {
      const { broker_id, broker, ...listingWithoutBroker } = listing;
      return {
        listing: listingWithoutBroker,
        broker: {
          id: listing.broker.id,
          name: listing.broker.name,
          profile_pic: listing.broker.profile_pic,
        },
        company: {
          name: listing.broker.company?.name || "",
        },
      };
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/* Bulk insert listings */
export const bulkInsertListingsService = async (listings: CreateListingInput[]) => {
  try {
    const newListings = await prisma.listing.createMany({
      data: listings,
    });

    return newListings;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
