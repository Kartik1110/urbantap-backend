import jwt from 'jsonwebtoken';
import logger from '@/utils/logger';
import { Request, Response } from 'express';
import { getDashboardStatsService } from './dashboard.service';

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
            data: {
                profile_completion_percentage:
                    stats.profile_completion_percentage,
                jobs_count: stats.jobs_count,
                projects_count: stats.projects_count,
                rental_listings_count: stats.rental_listings_count,
                selling_listings_count: stats.selling_listings_count,
            },
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
