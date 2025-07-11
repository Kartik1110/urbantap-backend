import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';

const router = Router();

// Get dashboard stats
router.get('/dashboard/stats', getDashboardStats);

export default router;
