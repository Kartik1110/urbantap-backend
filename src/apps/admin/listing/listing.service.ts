import logger from '../../../utils/logger';
import prisma from '../../../utils/prisma';
import { geocodeAddress } from '../../../utils/geocoding';
import { Listing, Admin_Status } from '@prisma/client';

/* Bulk insert listings */
export const bulkInsertListingsAdminService = async (
    listings: Listing[],
    brokerageId: string
) => {
    try {
        const enrichedListings = [];

        for (const listing of listings) {
            let enrichedListing = {
                ...listing,
                admin_status: Admin_Status.Pending,
                brokerage_id: brokerageId,
            };

            // Add locality information if address is provided
            if (listing.address) {
                const rawAddress = `${listing.address}, Dubai`;
                const geocodeResult = await geocodeAddress(rawAddress);

                if (geocodeResult) {
                    enrichedListing = {
                        ...enrichedListing,
                        address: geocodeResult.formatted_address,
                        locality: geocodeResult.locality,
                    };
                    logger.info(
                        `✅ Geocoded listing with address: ${listing.address}`
                    );
                } else {
                    logger.warn(
                        `⚠️ Unable to geocode address: ${listing.address}`
                    );
                }
            }

            enrichedListings.push(enrichedListing);

            // Add a small delay to respect API limits (100ms)
            if (listings.length > 1) {
                await new Promise((resolve) => global.setTimeout(resolve, 100));
            }
        }

        // Use createMany for bulk insertion
        const result = await prisma.listing.createMany({
            data: enrichedListings,
            skipDuplicates: true,
        });

        return result;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const getListingsForBrokerageService = async (brokerageId: string) => {
    // Get all listings for the brokerage that are not sponsored
    return await prisma.listing.findMany({
        where: {
            brokerage_id: brokerageId,
            is_sponsored: false,
        },
        orderBy: {
            created_at: 'desc',
        },
    });
};

export const getSponsoredListingsForBrokerageService = async (
    brokerageId: string
) => {
    return await prisma.listing.findMany({
        where: {
            brokerage_id: brokerageId,
            is_sponsored: true,
        },
        orderBy: {
            created_at: 'desc',
        },
    });
};

export const bulkUpdateListingsSponsorshipService = async (
    listingIds: string[]
) => {
    if (!listingIds || listingIds.length === 0) {
        throw new Error('Listing IDs array cannot be empty');
    }

    const updatedListings = await prisma.listing.updateMany({
        where: {
            id: {
                in: listingIds,
            },
        },
        data: {
            is_sponsored: true,
        },
    });

    return updatedListings;
};
