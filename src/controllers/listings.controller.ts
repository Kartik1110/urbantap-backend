import { Request, Response } from "express";
import { Listing } from "@prisma/client";
import {
  getListingsService,
  bulkInsertListingsService,
} from "../services/listings.service";
import { uploadToS3 } from "../utils/s3Upload";
import { ListingFilters, CreateListingInput } from "../schemas/listing.schema";

/* Get listings */
export const getListings = async (req: Request<{}, {}, {}, ListingFilters>, res: Response) => {
  try {
    const listings = await getListingsService(req.query);

    res.json({
      status: "success",
      message: "Listings fetched successfully",
      data: listings,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch listings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/* Bulk insert listings */
export const bulkInsertListings = async (req: Request, res: Response) => {
  const images = req.files as Express.Multer.File[];
  const listings = req.body.listings;

  if (!images || images.length === 0) {
    return res.status(400).json({
      status: "error",
      message: "No images provided",
    });
  }

  if (!listings) {
    return res.status(400).json({
      status: "error",
      message: "No listings data provided",
    });
  }

  // Upload images to S3 and get URLs
  let imageUrls: string[] = [];
  try {
    imageUrls = await Promise.all(
      images.map(async (image) => {
        if (!image.originalname) {
          throw new Error("Invalid file name");
        }
        const fileExtension = image.originalname.split(".").pop();
        if (!fileExtension) {
          throw new Error("Invalid file extension");
        }
        return await uploadToS3(
          image.path,
          `listings/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`
        );
      })
    );
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to upload images to S3",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  let parsedListings: CreateListingInput[];
  try {
    parsedListings = JSON.parse(listings);
    if (!Array.isArray(parsedListings)) {
      throw new Error("Listings must be an array");
    }
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Invalid listings data format",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }

  const listingsWithImages = parsedListings.map((listing) => ({
    ...listing,
    image_urls: imageUrls,
  }));

  try {
    const newListings = await bulkInsertListingsService(listingsWithImages);
    res.json({
      status: "success",
      message: "Listings inserted successfully",
      data: newListings,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to insert listings",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
