import { Router } from 'express';
import { getOrders } from './order.controller';
import { verifyToken } from '@/utils/verifyToken';
import { requireTeamManagementAccess } from '@/middlewares/rbac.middleware';

const router = Router();

router.get(
    '/admin-user/orders',
    verifyToken,
    requireTeamManagementAccess(),
    getOrders
);

export default router;
