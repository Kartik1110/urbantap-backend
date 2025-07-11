import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Get dashboard stats
router.get('/dashboard/stats', authMiddleware, getDashboardStats);

export default router;
