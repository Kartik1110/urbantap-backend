import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { Listing } from "@prisma/client";
import {
  getListingsService,
  bulkInsertListingsService,
  deleteListingbyId,
  getListingByIdService,
  reportListingService,
  editListingService,
} from "../services/listings.service";
import { uploadToS3 } from "../utils/s3Upload";
import prisma from "../utils/prisma";
import { City } from "@prisma/client";

/* Get listings */
export const getListings = async (req: Request, res: Response) => {
  const filters = req.body || {};

  try {
    const listings = await getListingsService(filters);

    res.json({
      status: "success",
      message: "Listings fetched successfully",
      data: listings,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch listings",
      error: error,
    });
  }
};

/* Get listing by id */
export const getListingById = async (req: Request, res: Response) => {
  const listingId = req.params.id;
  const listing = await getListingByIdService(listingId);
  res.json({
    status: "success",
    message: "Listing fetched successfully",
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
          const fileExtension = image.originalname.split(".").pop();
          return await uploadToS3(
            image.path,
            `listings/${Date.now()}-${uuidv4()}.${fileExtension}`
          );
        })
      );
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to upload images to S3",
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
      status: "success",
      message: "Listings inserted successfully",
      data: listings,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to insert listings",
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
      status: "error",
      message: "Invalid listing data format",
    });
  }

  if (images && images.length > 0) {
    try {
      imageUrls = await Promise.all(
        images.map(async (image) => {
          const fileExtension = image.originalname.split(".").pop();
          return await uploadToS3(
            image.path,
            `listings/${Date.now()}.${fileExtension}`
          );
        })
      );
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Failed to upload images to S3",
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
      status: "success",
      message: "Listing updated successfully",
      data: updatedListing,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to update listing",
      error,
    });
  }
};

/* Delete Listing by Id */
export const deleteListing = async (req: Request, res: Response) => {
  const { listingId, brokerId } = req.body;

  if (!listingId || !brokerId) {
    return res.status(400).json({
      status: "error",
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
      status: "error",
      message: "Failed to fetch listing details - Listing not found",
    });
  }

  //check if broker id and listingId matches
  if (listingDetails.broker_id !== brokerId) {
    return res.status(403).json({
      status: "error",
      message: "You are not allowed to delete this listing",
    });
  }

  try {
    await deleteListingbyId(listingId);
    return res.status(200).json({
      status: "success",
      message: `Listing with id ${listingId} deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to delete listing",
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
      status: "error",
      message: "Missing 'listingId' in request body",
    });
  }

  try {
    await reportListingService(listingId, reason, description, brokerId);
    return res.status(200).json({
      status: "success",
      message: "Listing reported successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to report listing",
      error: error,
    });
  }
};
