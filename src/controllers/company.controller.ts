import { Request, Response } from "express";
import { bulkInsertCompaniesService, getCompaniesService } from "../services/company.service";

export const bulkInsertCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await bulkInsertCompaniesService(req.body);
    res.json({
      status: "success",
      message: "Companies inserted successfully",
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to insert companies",
      error: error,
    });
  }
};

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const { search = "" } = req.query;
    const companies = await getCompaniesService({ search: String(search) });
    res.json({
      status: "success",
      message: "Companies fetched successfully",
      data: companies,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch companies",
      error: error,
    });
  }
};