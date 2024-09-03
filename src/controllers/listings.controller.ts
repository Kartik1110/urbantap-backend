import { Request, Response } from "express";
import {
  getListingsService,
  bulkInsertListingsService,
} from "../services/listings.service";

/* Get listings */
export const getListings = async (req: Request, res: Response) => {
  try {
    const listings = await getListingsService();
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
  try {
    const listings = await bulkInsertListingsService(req.body);
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
