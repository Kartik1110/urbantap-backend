import prisma from "../utils/prisma";
import { Listing } from "@prisma/client";

/* Get listings */
interface ListingFilters {
  [key: string]: any; // TODO: Define the type of filters
}

export const getListingsService = async (
  filters: {
    min_price?: number;
    max_price?: number;
    min_sqft?: number;
    max_sqft?: number;
  } & ListingFilters
): Promise<
  Array<{
    listing: Partial<Listing>;
    broker: {
      id: string;
      name: string;
      profile_pic: string;
    };
    company: {
      name: string;
    };
  }>
> => {
  try {
    const { min_price, max_price, min_sq_ft, max_sq_ft, ...otherFilters } =
      filters;

    const listings = await prisma.listing.findMany({
      where: {
      ...otherFilters,
      AND: [
        {
        OR: [
          {
          min_price: {
            gte: min_price,
          },
          max_price: {
            lte: max_price,
          },
          },
        ],
        },
        {
        sq_ft: {
          ...(min_sq_ft && { gte: min_sq_ft }),
          ...(max_sq_ft && { lte: max_sq_ft }),
        },
        },
      ],
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
          name: listing.broker.company.name,
        },
      };
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/* Bulk insert listings */
export const bulkInsertListingsService = async (listings: Listing[]) => {
  try {
    const newListings = await prisma.listing.createMany({
      data: listings,
    });

    await prisma.listing.createMany({
      data: listings,
    });

    return newListings;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
