import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { Listing } from '@prisma/client';
import {
    getListingsService,
    bulkInsertListingsService,
    deleteListingbyId,
    getListingByIdService,
    reportListingService,
    editListingService,
    generateListingFromTextService,
    getTopLocalitiesWithCounts,
    getFeaturedListingsService,
    getRecentListingsService,
    getListingAppreciationProjections,
    getListingROIReportService,
} from '../services/listings.service';
import { uploadToS3 } from '../utils/s3Upload';
import prisma from '../utils/prisma';

/* Get listings */
export const getListings = async (req: Request, res: Response) => {
    const filters = req.body || {};

    try {
        const listings = await getListingsService(filters);

        res.json({
            status: 'success',
            message: 'Listings fetched successfully',
            data: listings,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch listings',
            error: error,
        });
    }
};

/* Get featured listings */
export const getFeaturedListings = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.body.page as string) || 1;
        const page_size = parseInt(req.body.page_size as string) || 10;

        const result = await getFeaturedListingsService(page, page_size);
        res.json({
            status: 'success',
            message: 'Featured listings fetched successfully',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch featured listings',
            error: error,
        });
    }
};

/* Get recent listings */
export const getRecentListings = async (req: Request, res: Response) => {
    try {
        const listings = await getRecentListingsService();
        res.json({
            status: 'success',
            message: 'Recent listings fetched successfully',
            data: listings,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch recent listings',
            error: error,
        });
    }
};

/* Get listing by id */
export const getListingById = async (req: Request, res: Response) => {
    const listingId = req.params.id;
    const userId = (req as any).user?.userId; // Extract user ID from authenticated request

    const listing = await getListingByIdService(listingId, userId);
    res.json({
        status: 'success',
        message: 'Listing fetched successfully',
        data: listing,
    });
};

/* Bulk insert listings */
export const bulkInsertListings = async (req: Request, res: Response) => {
    const images = req.files as Express.Multer.File[] | undefined;
    const listings = req.body.listings;

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
        const listings = await bulkInsertListingsService(listingsWithImages);
        res.json({
            status: 'success',
            message: 'Listings inserted successfully',
            data: listings,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to insert listings',
            error: error,
        });
    }
};

export const editListingController = async (req: Request, res: Response) => {
    const listingId = req.params.id;
    const listingString = req.body.listing; // JSON string of the listing update
    const images = req.files as Express.Multer.File[] | undefined;

    let updates: Partial<Listing>;
    let imageUrls: string[] = [];

    try {
        updates = JSON.parse(listingString); // Parse listing from JSON string
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Invalid listing data format',
        });
    }

    if (images && images.length > 0) {
        try {
            imageUrls = await Promise.all(
                images.map(async (image) => {
                    const fileExtension = image.originalname.split('.').pop();
                    return await uploadToS3(
                        image.path,
                        `listings/${Date.now()}.${fileExtension}`
                    );
                })
            );
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to upload images to S3',
                error,
            });
        }
    }

    // Merge new images if provided
    if (imageUrls.length > 0) {
        updates.image_urls = imageUrls;
    }

    try {
        const updatedListing = await editListingService(listingId, updates);
        return res.json({
            status: 'success',
            message: 'Listing updated successfully',
            data: updatedListing,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Failed to update listing',
            error,
        });
    }
};

/* Delete Listing by Id */
export const deleteListing = async (req: Request, res: Response) => {
    const { listingId, brokerId } = req.body;

    if (!listingId || !brokerId) {
        return res.status(400).json({
            status: 'error',
            message: "Missing 'listingId' or 'brokerId' in request body",
        });
    }

    // const listingDetails = await getListingByIdService(listingId);
    const listingDetails = await prisma.listing.findUnique({
        where: {
            id: listingId,
        },
    });

    // Check if listing details are empty
    if (!listingDetails) {
        return res.status(404).json({
            status: 'error',
            message: 'Failed to fetch listing details - Listing not found',
        });
    }

    //check if broker id and listingId matches
    if (listingDetails.broker_id !== brokerId) {
        return res.status(403).json({
            status: 'error',
            message: 'You are not allowed to delete this listing',
        });
    }

    try {
        await deleteListingbyId(listingId);
        return res.status(200).json({
            status: 'success',
            message: `Listing with id ${listingId} deleted successfully`,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Failed to delete listing',
            error: error,
        });
    }
};

/* Report a listing */
export const reportListing = async (req: Request, res: Response) => {
    const listingId = req.params.id;

    const { reason, description, brokerId } = req.body;

    if (!listingId) {
        return res.status(400).json({
            status: 'error',
            message: "Missing 'listingId' in request body",
        });
    }

    try {
        await reportListingService(listingId, reason, description, brokerId);
        return res.status(200).json({
            status: 'success',
            message: 'Listing reported successfully',
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Failed to report listing',
            error: error,
        });
    }
};

// Generate Listing from Text
export const generateListingFromText = async (req: Request, res: Response) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({
            status: 'error',
            message: "Missing 'text' in request body",
        });
    }

    try {
        const listing = await generateListingFromTextService(text);
        return res.status(200).json({
            status: 'success',
            message: 'Listing generated successfully',
            data: listing,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Failed to generate listing',
            error,
        });
    }
};

// Fetch popular localities
export const getPopularLocalities = async (req: Request, res: Response) => {
    try {
        const popularLocalities = await getTopLocalitiesWithCounts();

        return res.status(200).json({
            status: 'success',
            message: 'Top 7 popular localities fetched successfully',
            data: popularLocalities,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch popular localities',
            error,
        });
    }
};

// Get listing appreciation projections
export const getListingAppreciation = async (req: Request, res: Response) => {
    const listingId = req.params.id;

    try {
        const appreciation = await getListingAppreciationProjections(listingId);

        return res.status(200).json({
            status: 'success',
            message: 'Listing appreciation fetched successfully',
            data: {
                cumulative_appreciation_percentage: appreciation,
            },
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message:
                (error as Error).message ||
                'Failed to fetch listing appreciation',
            error,
        });
    }
};

// Get listing ROI report
export const getListingROIReport = async (req: Request, res: Response) => {
    const listingId = req.params.id;
    const {
        user_preference: num_of_years,
        goal,
        mortgage,
    }: {
        user_preference: number;
        goal: 'Rental' | 'Self Use';
        mortgage: boolean;
    } = req.body;

    try {
        const roiReport = await getListingROIReportService(listingId, {
            num_of_years,
            is_self_use: goal === 'Self Use',
            is_self_paid: mortgage,
        });

        return res.status(200).json({
            status: 'success',
            message: 'Listing ROI report fetched successfully',
            data: roiReport,
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message:
                (error as Error).message ||
                'Failed to fetch listing ROI report',
            error,
        });
    }
};
