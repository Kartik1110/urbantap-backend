import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import logger from '@/utils/logger';
import {
    applyJobService,
    createJobService,
    getJobsService,
    getJobByIdService,
    getJobsAppliedByBrokerService,
} from './job.service';

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        [key: string]: any;
    };
}

export const applyJob = async (req: Request, res: Response) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(
        token.replace('Bearer ', ''),
        process.env.JWT_SECRET!
    ) as {
        userId: string;
    };

    const resume = req.file?.path;

    if (!resume) {
        return res.status(400).json({ message: 'Resume is required' });
    }

    try {
        const job = await applyJobService(req.body, decoded.userId, resume);
        res.status(200).json({
            message: 'Job applied successfully',
            data: job,
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const createJob = async (req: Request, res: Response) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(
        token.replace('Bearer ', ''),
        process.env.JWT_SECRET!
    ) as {
        userId: string;
    };

    try {
        const job = await createJobService({
            ...req.body,
            userId: decoded.userId,
        });
        res.status(200).json({
            message: 'Job created successfully',
            data: job,
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const getJobs = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId || undefined;

    try {
        const bodyParams = {
            page: req.body.page || undefined,
            page_size: req.body.page_size || undefined,
            search: req.body.search || undefined,
            show_expired_sponsored: req.body.show_expired_sponsored || false, // Always filter out expired sponsored jobs by default
        };

        const { jobs, pagination } = await getJobsService(bodyParams, userId);

        res.status(200).json({
            status: 'success',
            message: 'Jobs fetched successfully',
            data: { jobs, pagination },
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const getJobById = async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId || undefined;

    try {
        const job = await getJobByIdService(id, userId);
        res.status(200).json({
            status: 'success',
            message: 'Job fetched successfully',
            data: job,
        });
    } catch (error) {
        logger.error(error);
        res.status(404).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const getJobsAppliedByBroker = async (req: Request, res: Response) => {
    const { brokerId } = req.params;

    try {
        const result = await getJobsAppliedByBrokerService(brokerId);
        res.status(200).json({
            status: 'success',
            message: 'Jobs applied by broker fetched successfully',
            data: result,
        });
    } catch (error) {
        logger.error(error);
        res.status(404).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
