import { v4 as uuidv4 } from 'uuid';
import { Response, Express } from 'express';
import { uploadToS3 } from '../../../utils/s3Upload';
import { CompanyType, Listing } from '@prisma/client';
import { AuthenticatedRequest } from '../../../utils/verifyToken';
import {
    bulkInsertListingsAdminService,
    getListingsForBrokerageService,
    getSponsoredListingsForBrokerageService,
    bulkUpdateListingsSponsorshipService,
} from './listing.service';
import logger from '../../../utils/logger';

/* Bulk insert listings */
export const bulkInsertListingsAdmin = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    const images = req.files as Express.Multer.File[] | undefined;
    const listings = req.body.listings;

    const brokerageId = req.user?.entityId;
    if (!brokerageId || req.user?.type !== CompanyType.Brokerage) {
        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized',
        });
    }

    let imageUrls: string[] = [];

    // Only process images if they exist
    if (images && images.length > 0) {
        try {
            imageUrls = await Promise.all(
                images.map(async (image) => {
                    const fileExtension = image.originalname.split('.').pop();
                    return await uploadToS3(
                        image.path,
                        `listings/${Date.now()}-${uuidv4()}.${fileExtension}`
                    );
                })
            );
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Failed to upload images to S3',
                error: error,
            });
        }
    }

    const listingsWithImages = JSON.parse(listings).map((listing: Listing) => ({
        ...listing,
        image_urls: imageUrls,
    }));

    try {
        const listings = await bulkInsertListingsAdminService(
            listingsWithImages,
            brokerageId
        );
        res.json({
            status: 'success',
            message: 'Listings inserted successfully',
            data: listings,
        });
    } catch (error) {
        logger.error('create listing error', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to insert listings',
            error: error,
        });
    }
};

export const getListingsForBrokerage = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const brokerageId = req.user?.entityId;
        if (!brokerageId || req.user?.type !== CompanyType.Brokerage) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized',
            });
        }

        const listings = await getListingsForBrokerageService(brokerageId);

        res.status(200).json({
            status: 'success',
            data: listings,
        });
    } catch (error: any) {
        logger.error('Get Listings for brokerage error', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getSponsoredListingsForBrokerage = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const brokerageId = req.user?.entityId;
        if (!brokerageId || req.user?.type !== CompanyType.Brokerage) {
            return res.status(401).json({
                status: 'error',
                message:
                    'Unauthorized: Only brokerage companies can access this endpoint',
            });
        }

        const sponsoredListings =
            await getSponsoredListingsForBrokerageService(brokerageId);

        res.status(200).json({
            status: 'success',
            message: 'Sponsored listings fetched successfully',
            data: sponsoredListings,
            count: sponsoredListings.length,
        });
    } catch (error: any) {
        logger.error('Get sponsored listings error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch sponsored listings',
        });
    }
};

export const bulkUpdateListingsSponsorshipController = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { listingIds } = req.body;

        if (
            !listingIds ||
            !Array.isArray(listingIds) ||
            listingIds.length === 0
        ) {
            return res.status(400).json({
                status: 'error',
                message: 'listingIds must be a non-empty array of strings',
            });
        }

        if (listingIds.some((id) => typeof id !== 'string')) {
            return res.status(400).json({
                status: 'error',
                message: 'All listing IDs must be strings',
            });
        }

        const updatedListings =
            await bulkUpdateListingsSponsorshipService(listingIds);

        res.status(200).json({
            status: 'success',
            message: `Successfully updated ${updatedListings.count} listings to sponsored`,
            data: {
                updatedCount: updatedListings.count,
                listingIds,
            },
        });
    } catch (error: any) {
        logger.error('Bulk update listings sponsorship error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to update listings sponsorship',
        });
    }
};
