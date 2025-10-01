import { Router } from 'express';
import { verifyToken } from '@/utils/verifyToken';
import { requireTeamManagementAccess } from '@/middlewares/rbac.middleware';
import { getBrokers } from './broker.controller';

const router = Router();

/* Broker Routes */
router.get(
    '/admin-user/brokers',
    verifyToken,
    requireTeamManagementAccess(),
    getBrokers
);

export default router;
