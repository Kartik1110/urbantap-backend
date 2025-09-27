import logger from '@/utils/logger';
import { Response } from 'express';
import { AuthenticatedRequest } from '@/utils/verifyToken';
import { BrokerService } from './broker.service';

export const getBrokers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found for user',
            });
        }
        const users = await BrokerService.getBrokers(companyId);

        res.status(200).json({
            status: 'success',
            data: users,
        });
    } catch (error: any) {
        logger.error('Get brokers error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
