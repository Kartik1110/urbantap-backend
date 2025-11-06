import { Request, Response } from 'express';
import {
    getAdminListingsService,
    updateListingStatusService,
    getUserListService,
    assignCreditsToCompany,
} from './admin.service';
import logger from '@/utils/logger';
import { getBrokerListService } from '@/apps/user/broker/broker.service';

import {
    Bathrooms,
    Bedrooms,
    Furnished,
    Type,
    Rental_frequency,
    Admin_Status,
} from '@prisma/client';

function convertToEnumArray<T>(input: any[], enumObj: any): T[] {
    return (input || []).filter((item) =>
        Object.values(enumObj).includes(item)
    );
}

export const getAdminListings = async (req: Request, res: Response) => {
    try {
        const {
            page,
            page_size,
            search,
            no_of_bathrooms,
            no_of_bedrooms,
            furnished,
            type,
            rental_frequency,
            project_age,
            payment_plan,
            sale_type,
            admin_status,
            ...rest
        } = req.query;

        const filters = {
            ...rest,
            search: typeof search === 'string' ? search : undefined, // ✅ Normalize search
            page: Number(page) || 1,
            page_size: Number(page_size) || 10,
            no_of_bathrooms: convertToEnumArray<Bathrooms>(
                typeof no_of_bathrooms === 'string'
                    ? no_of_bathrooms.split(',')
                    : [],
                Bathrooms
            ),
            no_of_bedrooms: convertToEnumArray<Bedrooms>(
                typeof no_of_bedrooms === 'string'
                    ? no_of_bedrooms.split(',')
                    : [],
                Bedrooms
            ),
            furnished: convertToEnumArray<Furnished>(
                typeof furnished === 'string' ? furnished.split(',') : [],
                Furnished
            ),
            type: convertToEnumArray<Type>(
                typeof type === 'string' ? type.split(',') : [],
                Type
            ),
            rental_frequency: convertToEnumArray<Rental_frequency>(
                typeof rental_frequency === 'string'
                    ? rental_frequency.split(',')
                    : [],
                Rental_frequency
            ),
            project_age:
                typeof project_age === 'string'
                    ? (project_age.split(',') as (
                          | 'Less_than_5_years'
                          | 'More_than_5_years'
                      )[])
                    : [],
            payment_plan:
                typeof payment_plan === 'string'
                    ? (payment_plan.split(',') as (
                          | 'Payment_done'
                          | 'Payment_Pending'
                      )[])
                    : [],
            sale_type:
                typeof sale_type === 'string'
                    ? (sale_type.split(',') as ('Direct' | 'Resale')[])
                    : [],
            admin_status: convertToEnumArray<Admin_Status>(
                typeof admin_status === 'string' ? admin_status.split(',') : [],
                Admin_Status
            ),
        };

        const listings = await getAdminListingsService(filters);

        res.json({
            status: 'success',
            message: 'Listings fetched successfully',
            data: listings,
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

export const updateListingStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updatedListing = await updateListingStatusService(id, status);
        return res.status(200).json(updatedListing);
    } catch (error: any) {
        console.error('❌ Error updating listing status:', error.message);
        if (error.message === 'Invalid status value') {
            return res.status(400).json({ message: error.message });
        }
        if (error.message === 'Listing not found') {
            return res.status(404).json({ message: error.message });
        }
        return res
            .status(500)
            .json({ message: 'Internal Server Error', error });
    }
};

export const getUserList = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        const page = parseInt(req.query.page as string) || 1;
        const page_size = parseInt(req.query.page_size as string) || 10000;

        const search = (req.query.search as string) || '';
        const searchType = (req.query.searchType as string) || ''; // new

        const startDate = req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined;
        const endDate = req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined;

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
            status: 'success',
            message: 'User list fetched successfully',
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
            status: 'error',
            message: 'Failed to fetch user list',
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
                message: 'Unauthorized',
            });
        }

        // Extract pagination parameters from body with defaults
        const page = parseInt(req.query.page as string) || 1;
        const page_size = parseInt(req.query.page_size as string) || 10;
        const search = req.query.search as string;

        const { brokers, pagination } = await getBrokerListService({
            page,
            page_size,
            token,
            search,
        });

        res.json({
            status: 'success',
            message: 'Broker list fetched successfully',
            data: {
                brokers,
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
            status: 'error',
            message: 'Failed to fetch broker list',
            error: error,
        });
    }
};

// Admin endpoint: Assign credits to a company
export const assignCredits = async (req: Request, res: Response) => {
    try {
        const { company_id, credits, expiry_days } = req.body;

        if (!company_id || !credits) {
            return res.status(400).json({
                success: false,
                message: 'company_id and credits are required',
            });
        }

        if (typeof credits !== 'number' || credits <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Credits must be a positive number',
            });
        }

        const result = await assignCreditsToCompany({
            company_id,
            credits,
            expiry_days,
        });

        res.status(200).json({
            success: true,
            message: 'Credits assigned successfully',
            data: result,
        });
    } catch (error) {
        logger.error('Assign credits error:', error);
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Internal server error',
        });
    }
};
