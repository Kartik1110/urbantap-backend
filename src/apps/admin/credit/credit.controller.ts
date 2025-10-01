import logger from '@/utils/logger';
import { Request, Response } from 'express';
import { CreditService } from './credit.service';
import { AuthenticatedRequest } from '@/utils/verifyToken';

// Admin endpoint: Assign credits to a company
export const assignCredits = async (req: Request, res: Response) => {
    try {
        const { company_id, credits, expiry_days } = req.body;

        if (!company_id || !credits) {
            return res.status(400).json({
                success: false,
                message: 'company_id and credits are required',
            });
        }

        if (typeof credits !== 'number' || credits <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Credits must be a positive number',
            });
        }

        const result = await CreditService.assignCreditsToCompany({
            company_id,
            credits,
            expiry_days,
        });

        res.status(200).json({
            success: true,
            message: 'Credits assigned successfully',
            data: result,
        });
    } catch (error) {
        logger.error('Assign credits error:', error);
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Internal server error',
        });
    }
};

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

        const creditInfo = await CreditService.getCompanyCreditBalance(
            user.companyId
        );

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
