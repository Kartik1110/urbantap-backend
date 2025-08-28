import { Request, Response } from 'express';
import { getOrdersService } from '../services/order.service';

export const getOrders = async (req: Request, res: Response) => {
    try {
        const { company_id } = req.params;
        const orders = await getOrdersService(company_id);

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
