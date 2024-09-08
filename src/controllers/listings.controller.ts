import { Request, Response } from "express";
import { Listing } from "@prisma/client";
import {
  getListingsService,
  bulkInsertListingsService,
} from "../services/listings.service";
import { getBrokerDetailService } from "../services/brokers.service";
import { uploadToS3 } from "../utils/s3Upload";

/* Get listings */
export const getListings = async (req: Request, res: Response) => {
  try {
    const listings = await getListingsService();

    const listingsWithBrokers = await Promise.all(
      listings.map(async (listing) => {
        const brokerDetail = await getBrokerDetailService(listing.broker_id);
        return {
          ...listing,
          broker_name: brokerDetail?.name,
        };
      })
    );


    res.json({
      status: "success",
      message: "Listings fetched successfully",
      data: listingsWithBrokers,
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
  const images = req.files as Express.Multer.File[];
  const listings = req.body.listings;

  // Upload images to S3 and get URLs
  let imageUrls: string[] = [];
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
