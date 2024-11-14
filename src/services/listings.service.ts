import prisma from "../utils/prisma";
import { Listing } from "@prisma/client";

/* Get listings */
interface ListingFilters {
  [key: string]: any;  // TODO: Define the type of filters
}

export const getListingsService = async (filters: ListingFilters): Promise<(Listing & { broker: any })[]> => {
  try {
    const listings = await prisma.listing.findMany({
      where: filters,
      include: {
        broker: {
          select: {
            company: true,
            name: true
          },
        },
      },
    });
    return listings;
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
