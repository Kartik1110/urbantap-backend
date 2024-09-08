import prisma from "../utils/prisma";
import { Listing } from "@prisma/client";

/* Get listings */
export const getListingsService = async () => {
  try {
    const listings = await prisma.listing.findMany();
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
