import { Request, Response } from 'express';
import {
    getBrokeragesService,
    createBrokerageService,
    getBrokerageDetailsService,
    getAboutService,
    getListingsService,
    getBrokersService,
    getJobsService,
} from '../services/brokerage.service';

export const getBrokerages = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const search = (req.query.search as string) || '';

        const { brokerages, pagination } = await getBrokeragesService({
            page,
            pageSize,
            search,
        });

        res.json({
            status: 'success',
            message: 'Brokerages fetched successfully',
            data: { brokerages, pagination },
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch brokerages',
            error,
        });
    }
};

export const createBrokerage = async (req: Request, res: Response) => {
    try {
        const brokerage = await createBrokerageService(req.body);
        res.json({
            status: 'success',
            message: 'Brokerage created successfully',
            data: brokerage,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to create brokerage',
            error,
        });
    }
};

export const getBrokerageDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const brokerageDetails = await getBrokerageDetailsService(id);
        res.json({
            status: 'success',
            message: 'Brokerage details fetched successfully',
            data: brokerageDetails,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch brokerage details',
            error,
        });
    }
};

export const getBrokerageAbout = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // const brokerageDetails = await getBrokerageDetailsService(id);
        const data = await getAboutService(req.params.id);
        res.json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch about',
            error,
        });
    }
};

export const getBrokerageListings = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const listingsData = await getListingsService(id);

        res.json({
            status: 'success',
            message: 'Listings fetched successfully',
            data: listingsData.listings,
            pagination: listingsData.pagination,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch brokerage listings',
            error,
        });
    }
};
export const getBrokerageBrokers = async (req: Request, res: Response) => {
    try {
        const data = await getBrokersService(req.params.id);
        res.json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch brokers',
            error,
        });
    }
};

export const getBrokerageJobs = async (req: Request, res: Response) => {
    try {
        const data = await getJobsService(req.params.id);
        res.json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch jobs',
            error,
        });
    }
};
