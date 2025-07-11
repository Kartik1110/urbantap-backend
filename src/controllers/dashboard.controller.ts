import { Request, Response } from 'express';
import {
    getDashboardStatsService,
    getUserIdFromToken,
} from '../services/dashboard.service';
import logger from '../utils/logger';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized',
            });
        }

        // Extract user ID from token
        const userId = getUserIdFromToken(token);

        // Get dashboard stats
        const stats = await getDashboardStatsService(userId);

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
