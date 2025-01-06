import { Request, Response } from "express";
import { Listing } from "@prisma/client";
import {
  getListingsService,
  bulkInsertListingsService,
  deleteListingbyId,
  getListingByIdService,
} from "../services/listings.service";
import { uploadToS3 } from "../utils/s3Upload";
import prisma from "../utils/prisma";

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
            `listings/${Date.now()}.${fileExtension}`
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
