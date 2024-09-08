import { Request, Response } from "express";
import { Broker, Listing, Company } from "@prisma/client";
import prisma from "../utils/prisma";
import {
  getBrokerDetailService,
  getBrokerListService,
  bulkInsertBrokersService,
} from "../services/brokers.service";
import { uploadToS3 } from "../utils/s3Upload";


/* Get broker detail by id */
export const getBrokerDetail = async (req: Request, res: Response) => {
  const brokerId = req.params.id;
  try {
    let response: {
      broker: Broker | null;
      listings: Listing[];
      company: Company | null;
    } = { broker: null, listings: [], company: null };

    const broker = await getBrokerDetailService(brokerId);
    response.broker = broker;

    if (!broker) {
      return res.status(404).json({
        status: "error",
        message: "Broker not found",
      });
    }

    const listings = await prisma.listing.findMany({
      where: {
        broker_id: brokerId,
      },
    });

    response.listings = listings;

    const company = await prisma.company.findUnique({
      where: {
        id: broker.company_id,
      },
    });

    response.company = company;

    res.json({
      status: "success",
      message: "Broker detail fetched successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch broker detail",
      error: error,
    });
  }
};

/* Get broker list */
export const getBrokerList = async (req: Request, res: Response) => {
  try {
    const brokers = await getBrokerListService();
    res.json({
      status: "success",
      message: "Broker list fetched successfully",
      data: brokers,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch broker list",
      error: error,
    });
  }
};

// Bulk insert brokers
export const bulkInsertBrokers = async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File;
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

  // Upload single profile picture to S3 and get URL
  let profilePicUrl = '';
  if (file) {
    const fileExtension = file.originalname.split('.').pop();
    try {
      profilePicUrl = await uploadToS3(
        // file.buffer,
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
  }));

  try {
    const newBrokers = await bulkInsertBrokersService(brokersWithPics);
    const data = {
      broker_id: newBrokers[0], // return the single broker
      profilePicUrl: profilePicUrl,
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
