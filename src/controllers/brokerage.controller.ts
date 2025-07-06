import { Request, Response } from 'express';
import {
    getBrokeragesService,
    createBrokerageService,
    getBrokerageDetailsService,
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
            data: brokerages,
            pagination,
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
