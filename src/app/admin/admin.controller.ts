import { Request, Response } from "express";
import { getAdminListingsService, updateListingStatusService } from "./admin.service";

export const getAdminListings = async (req: Request, res: Response) => {
  const filters = req.body || {};

  try {
    const listings = await getAdminListingsService(filters);

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

export const updateListingStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
  
    try {
      const updatedListing = await updateListingStatusService(id, status);
      return res.status(200).json(updatedListing);
    } catch (error: any) {
      console.error("❌ Error updating listing status:", error.message);
      if (error.message === "Invalid status value") {
        return res.status(400).json({ message: error.message });
      }
      if (error.message === "Listing not found") {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal Server Error", error });
    }
  };
  
  
