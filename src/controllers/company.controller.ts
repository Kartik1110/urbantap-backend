import { Request, Response } from 'express';
import {
    bulkInsertCompaniesService,
    getCompaniesService,
    getBrokersByCompanyIdService,
    updateCompanyService,
    getListingsByCompanyIdService,
    getCompaniesByUserIdService,
} from '../services/company.service';
import { uploadToS3 } from "../utils/s3Upload"; // make sure path is correct
import { v4 as uuidv4 } from "uuid";


export const bulkInsertCompanies = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[] | undefined;
  const companies = JSON.parse(req.body.companies); // Expecting JSON.stringify(companies) from frontend

  if (!companies || companies.length === 0) {
    return res.status(400).json({
      status: "error",
      message: "No companies provided.",
    });
  }

  try {
    // Upload each logo file to S3 and attach the logo URL to its company
    const updatedCompanies = await Promise.all(
      companies.map(async (company: any, index: number) => {
        if (files && files[index]) {
          const file = files[index];
          const fileExtension = file.originalname.split(".").pop();
          const logoUrl = await uploadToS3(
            file.path,
            `companies/${Date.now()}-${file.originalname}`
          );
          return {
            ...company,
            logo: logoUrl,
          };
        } else {
          return company; // No logo uploaded
        }
      })
    );

    const inserted = await bulkInsertCompaniesService(updatedCompanies);

    res.json({
      status: "success",
      message: "Companies inserted successfully",
      data: inserted,
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
        const { search = '' } = req.query;
        const companies = await getCompaniesService({ search: String(search) });
        res.json({
            status: 'success',
            message: 'Companies fetched successfully',
            data: companies,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch companies',
            error: error,
        });
    }
};

export const getBrokersByCompanyId = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.id;

        const brokers = await getBrokersByCompanyIdService(companyId);

        res.json({
            status: 'success',
            message: 'Brokers fetched successfully',
            data: brokers,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch brokers for the company',
            error,
        });
    }
};

export const updateCompany = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.id;
        const updateData = req.body;

        const updatedCompany = await updateCompanyService(
            companyId,
            updateData
        );

        res.json({
            status: 'success',
            message: 'Company updated successfully',
            data: updatedCompany,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to update company',
            error,
        });
    }
};

export const getListingsByCompanyId = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const { listings, totalCount } = await getListingsByCompanyIdService(
            companyId,
            skip,
            limit
        );

        res.json({
            status: 'success',
            message: 'Listings fetched successfully',
            data: listings,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch listings',
            error,
        });
    }
};

export const getCompaniesByUserId = async (req: Request, res: Response) => {
    try {
        const companies = await getCompaniesByUserIdService();

        res.json({
            status: 'success',
            message: 'Companies fetched successfully for user',
            data: companies,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch companies by user ID',
            error,
        });
    }
};
