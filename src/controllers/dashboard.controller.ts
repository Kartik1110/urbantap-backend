import { Request, Response } from 'express';
import { getDashboardStatsService } from '../services/dashboard.service';
import logger from '../utils/logger';
import jwt from 'jsonwebtoken';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized',
            });
        }

        const decoded = jwt.verify(
            token.replace('Bearer ', ''),
            process.env.JWT_SECRET!
        ) as { userId: string };

        // Get dashboard stats
        const stats = await getDashboardStatsService(decoded.userId);

        res.json({
            status: 'success',
            message: 'Dashboard stats fetched successfully',
            data: stats,
        });
    } catch (error) {
        logger.error('Dashboard stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch dashboard stats',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
