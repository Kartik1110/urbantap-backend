import { Request, Response } from "express";
import {
  getListingsService,
  bulkInsertListingsService,
} from "../services/listings.service";
import { getBrokerDetailService } from "../services/brokers.service";

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
