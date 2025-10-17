import logger from '@/utils/logger';
import { Response } from 'express';
import { AuthenticatedRequest } from '@/utils/verifyToken';
import { getCompanyCreditBalance } from './credit.service';

// AdminUser endpoint: Get credit balance for their company
export const getCreditBalance = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        // Get company_id from authenticated admin user
        const user = req.user;
        if (!user?.companyId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: No company linked',
            });
        }

        const creditInfo = await getCompanyCreditBalance(user.companyId);

        res.status(200).json({
            success: true,
            data: creditInfo,
        });
    } catch (error) {
        logger.error('Get credit balance error:', error);
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Internal server error',
        });
    }
};
