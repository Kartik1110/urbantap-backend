import { Router } from 'express';
import { verifyToken } from '@/utils/verifyToken';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { adminMiddleware } from '@/middlewares/admin.middleware';
import { assignCredits, getCreditBalance } from './credit.controller';

const router = Router();

// Admin routes (for system admins to assign credits) - by Ruba
router.post(
    '/admin/credits/assign',
    authMiddleware,
    adminMiddleware,
    assignCredits
);

// AdminUser routes (for company admin users)
router.get('/admin-user/credits/balance', verifyToken, getCreditBalance);

export default router;
