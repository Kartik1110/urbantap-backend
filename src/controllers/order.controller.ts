import { Response } from 'express';
import { getOrdersService } from '../services/order.service';
import { AuthenticatedRequest } from '../utils/verifyToken';

export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Get company_id from authenticated admin user
        const user = req.user;
        if (!user?.companyId) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized: No company linked',
            });
        }

        const orders = await getOrdersService(user.companyId);

        res.status(200).json({
            status: 'success',
            data: orders,
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message:
                error instanceof Error ? error.message : 'Failed to get orders',
        });
    }
};
