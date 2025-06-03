import { Request, Response } from "express";
import { getAdminListingsService } from "../services/admin.service";
import { updateListingStatusService,getUserListService } from "../services/admin.service";
import logger from "../utils/logger";
import { getBrokerListService } from "../services/brokers.service";


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
  
export const getUserList = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const page_size = parseInt(req.query.page_size as string) || 10000;

    const search = (req.query.search as string) || "";
    const searchType = (req.query.searchType as string) || ""; // new

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const { users, pagination } = await getUserListService({
      page,
      page_size,
      token,
      search,
      searchType,
      startDate,
      endDate,
    });

    res.json({
      status: "success",
      message: "User list fetched successfully",
      data: {
        users,
        pagination: {
          total: pagination.total,
          page: pagination.page,
          page_size: pagination.page_size,
          total_pages: pagination.total_pages,
        },
      },
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user list",
      error: error,
    });
  }
};

export const getBrokerListforAdmins = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Extract pagination parameters from body with defaults
    const page = parseInt(req.query.page as string) || 1;
    const page_size = parseInt(req.query.page_size as string) || 10;
    const search = req.query.search as string;

    const { brokers, pagination } = await getBrokerListService({ page, page_size, token, search });

    res.json({
      status: "success",
      message: "Broker list fetched successfully",
      data: {
        brokers,
        pagination: {
          total: pagination.total,
          page: pagination.page,
          page_size: pagination.page_size,
          total_pages: pagination.total_pages
        }
      },
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch broker list",
      error: error,
    });
  }
};
