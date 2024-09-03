import { Request, Response } from "express";
import {
  getBrokerDetailService,
  getBrokerListService,
  bulkInsertBrokersService,
} from "../services/brokers.service";
import prisma from "../utils/prisma";
import { Broker, Listing, Company } from "@prisma/client";

/* Get broker detail by id */
export const getBrokerDetail = async (req: Request, res: Response) => {
  const brokerId = req.params.id;
  try {
    let response: {broker: Broker | null, listings: Listing[], company: Company | null} = {broker: null, listings: [], company: null}

    const broker = await getBrokerDetailService(brokerId);
    response.broker = broker

    if (!broker) {
      return res.status(404).json({
        status: "error",
        message: "Broker not found",
      });
    }

    const listings = await prisma.listing.findMany({
      where: {
        broker_id: brokerId
      }
    });

    response.listings = listings;

    const company = await prisma.company.findUnique({
      where: {
        id: broker.company_id
      }
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
  const brokers = req.body;
  try {
    const newBrokers = await bulkInsertBrokersService(brokers);
    res.json({
      status: "success",
      message: "Brokers inserted successfully",
      data: newBrokers,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to insert brokers",
      error: error,
    });
  }
};

