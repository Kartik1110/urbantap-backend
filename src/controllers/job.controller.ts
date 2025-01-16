import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import logger from "../utils/logger";
import { createJobService } from "../services/job.service";

export const createJob = async (req: Request, res: Response) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET!) as { userId: string };

  try {
    const job = await createJobService({ ...req.body, userId: decoded.userId });
    res.status(200).json({ message: "Job created successfully", data: job });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Internal server error", error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
