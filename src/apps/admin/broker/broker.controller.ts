import logger from '@/utils/logger';
import { Response, Express } from 'express';
import { AuthenticatedRequest } from '@/utils/verifyToken';
import { getBrokersService, createBrokerService } from './broker.service';

export const getBrokers = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found for user',
            });
        }
        const { independent } = req.query;

        const users = await getBrokersService(companyId, Boolean(independent));

        res.status(200).json({
            status: 'success',
            data: users,
        });
    } catch (error: any) {
        logger.error('Get brokers error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const createBroker = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { name, email, w_number, country_code } = req.body;

        const companyId = req.user?.companyId;
        if (!companyId) {
            return res.status(400).json({
                status: 'error',
                message: 'Company ID not found for user',
            });
        }

        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        await createBrokerService(companyId, {
            name,
            email,
            w_number,
            country_code,
            profile_pic: files?.profile_pic?.[0] || null,
        });

        res.status(200).json({
            status: 'success',
            data: 'Broker created successfully!',
        });
    } catch (error: any) {
        logger.error('Create broker error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
