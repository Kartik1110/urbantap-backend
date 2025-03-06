import { Request, Response } from "express";
import { Broker } from "@prisma/client";
import {
  getBrokerDetailService,
  getBrokerListService,
  bulkInsertBrokersService,
  updateBrokerService,
  blockBrokerService,
} from "../services/brokers.service";
import { uploadToS3 } from "../utils/s3Upload";
import logger from "../utils/logger";

/* Get broker detail by id */
export const getBrokerDetail = async (req: Request, res: Response) => {
  try {
    const brokerId = req.params.id;
    const token = req.headers.authorization;

    if (!brokerId) {
      return res.status(400).json({
        success: false,
        message: 'Broker ID is required'
      });
    }

    const broker = await getBrokerDetailService(brokerId, token as string);
    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: broker
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/* Get broker list */
export const getBrokerList = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Extract pagination parameters from body with defaults
    const page = parseInt(req.body.page as string) || 1;
    const page_size = parseInt(req.body.page_size as string) || 10;
    const search = req.body.search as string;

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

/* Bulk insert brokers */
export const bulkInsertBrokers = async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  const brokersJson = req.body.brokers;

  let brokers = [];
  try {
    brokers = JSON.parse(brokersJson);
  } catch (error) {
    return res.status(400).json({
      status: "error", 
      message: "Invalid brokers data",
    });
  }

  // Upload single profile picture to S3 and get URL if file exists
  let profilePicUrl = "";
  if (file) {
    const fileExtension = file.originalname.split(".").pop();
    try {
      profilePicUrl = await uploadToS3(
        file.path,
        `profiles/${Date.now()}.${fileExtension}`
      );
    } catch (error) {
      return res.status(400).json({
        status: "error",
        message: "Failed to upload file to S3",
      });
    }
  }

  const brokersWithPics = brokers.map((broker: Broker) => ({
    ...broker,
    profile_pic: profilePicUrl,
    company_id: broker.company_id || null
  }));

  try {
    const newBrokers = await bulkInsertBrokersService(brokersWithPics);
    const data = {
      broker_id: newBrokers[0], // return the single broker
      profilePicUrl: profilePicUrl,
      company_id: brokersWithPics[0].company_id || null
    };
    res.json({
      status: "success",
      message: "Brokers inserted successfully", 
      data: data,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Failed to insert brokers",
        error: error,
      });
    }
  }
};

/* Update Broker */
export const updateBroker = async (req: Request, res: Response) => {
  const brokerId = req.params.id;
  const updateData = JSON.parse(req.body.data);
  
  const file = req.file as Express.Multer.File | undefined;
  let profilePicUrl;

  if (file) {
    const fileExtension = file.originalname.split(".").pop();
    try {
      profilePicUrl = await uploadToS3(
        file.path,
        `profiles/${Date.now()}.${fileExtension}`
      );
    } catch (error) {
      return res.status(400).json({
        status: "error",
        message: "Failed to upload file to S3",
      });
    }
  }

  const updatedBrokerData = {
    ...updateData,
    profile_pic: profilePicUrl || updateData.profile_pic
  };

  try {
    await updateBrokerService(brokerId, updatedBrokerData);

    res.json({
      status: "success", 
      message: "Broker updated successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Failed to update broker",
        error: error,
      });
    }
  }
};

/* Block a broker */
export const blockBroker = async (req: Request, res: Response) => {
  const blockBrokerId = req.body.broker_id;
  const brokerId = req.params.id;

  if (!blockBrokerId) {
    return res.status(400).json({
      status: "error",
      message: "Broker ID is required",
    });
  }

  try {
    await blockBrokerService(brokerId, blockBrokerId);

    return res.status(200).json({
      status: "success",
      message: "Broker blocked successfully",
    });
  } catch (error) {
    return res.status(404).json({
      status: "error",
      message: "Broker not found",
    });
  }
};
