import prisma from "../utils/prisma";

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