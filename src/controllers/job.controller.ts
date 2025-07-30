import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import {
    applyJobService,
    createJobService,
    getJobsService,
    getJobByIdService,
    getJobsAppliedByBrokerService
} from '../services/job.service';

export const applyJob = async (req: Request, res: Response) => {
    console.log('req.body', req.body);

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

export const getJobs = async (req: Request, res: Response) => {
    const token = req.headers.authorization;

    let userId: string | null = null;

    if (token) {
        try {
            const decoded = jwt.verify(
                token.replace('Bearer ', ''),
                process.env.JWT_SECRET!
            ) as { userId: string };
            userId = decoded.userId;
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    }

    try {
        const { jobs, pagination } = await getJobsService(req.body, userId ?? undefined);

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


export const getJobById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const job = await getJobByIdService(id);
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
