import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import {
    applyJobService,
    createJobService,
    getJobsService,
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
    try {
        const jobs = await getJobsService(req.body);
        res.status(200).json({
            status: 'success',
            message: 'Jobs fetched successfully',
            data: jobs,
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
