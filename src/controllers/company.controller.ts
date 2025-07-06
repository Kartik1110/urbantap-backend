import { Request, Response } from 'express';
import {
    bulkInsertCompaniesService,
    getCompaniesService,
    getBrokersByCompanyIdService,
    updateCompanyService,
    getListingsByCompanyIdService,
    getCompaniesByUserIdService,
} from '../services/company.service';

export const bulkInsertCompanies = async (req: Request, res: Response) => {
    try {
        const companies = await bulkInsertCompaniesService(req.body);
        res.json({
            status: 'success',
            message: 'Companies inserted successfully',
            data: companies,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to insert companies',
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
        const { userId } = req.params;

        const companies = await getCompaniesByUserIdService(userId);

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
