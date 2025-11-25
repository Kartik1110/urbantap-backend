import { Request, Response } from 'express';
import { getLeadsService } from './lead.service';
import logger from '@/utils/logger';

/* Get leads for the logged-in broker */
export const getLeads = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        const leads = await getLeadsService(token);

        return res.status(200).json({
            success: true,
            data: leads,
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch leads',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
