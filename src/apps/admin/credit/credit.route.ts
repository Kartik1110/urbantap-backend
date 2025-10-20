import { Router } from 'express';
import { verifyToken } from '@/utils/verifyToken';
import { getCreditBalance } from './credit.controller';

const router = Router();

// AdminUser routes (for company admin users)
router.get('/admin-user/credits/balance', verifyToken, getCreditBalance);

export default router;
