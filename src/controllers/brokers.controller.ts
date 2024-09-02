import { Request, Response } from "express";
import {
  getBrokerDetailService,
  getBrokerListService,
} from "../services/brokers.service";

/* Get broker detail by id */
export const getBrokerDetail = async (req: Request, res: Response) => {
  const brokerId = parseInt(req.params.id);
  try {
    const broker = await getBrokerDetailService(brokerId);
    res.json({
      status: "success",
      message: "Broker detail fetched successfully",
      data: broker,
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


