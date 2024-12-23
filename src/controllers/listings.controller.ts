import { Request, Response } from "express";
import { Listing } from "@prisma/client";
import {
  getListingsService,
  bulkInsertListingsService,
} from "../services/listings.service";
import { uploadToS3 } from "../utils/s3Upload";

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

/* Bulk insert listings */
export const bulkInsertListings = async (req: Request, res: Response) => {
  const images = req.files as Express.Multer.File[] | undefined;
  const listings = req.body.listings;

  let imageUrls: string[] = [];
  
  // Only process images if they exist
  if (images && images.length > 0) {
    try {
      imageUrls = await Promise.all(images.map(async (image) => {
        const fileExtension = image.originalname.split('.').pop();
        return await uploadToS3(image.path, `listings/${Date.now()}.${fileExtension}`);
      }));
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
