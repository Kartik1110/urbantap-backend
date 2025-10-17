import multer from 'multer';
import express from 'express';
import { authMiddleware } from '@/middlewares/auth.middleware';

// Route modules
import authRoutes from '@/apps/user/auth/auth.route';
import brokerRoutes from '@/apps/user/broker/broker.route';
import companyRoutes from '@/apps/user/company/company.route';
import brokerageRoutes from '@/apps/user/brokerage/brokerage.route';
import dashboardRoutes from '@/apps/user/dashboard/dashboard.route';
import connectionRoutes from '@/apps/user/connection/connections.route';
import developerRoutes from '@/apps/user/developer/developer.route';
import inquiryRoutes from '@/apps/user/inquiry/inquiry.route';
import jobRoutes from '@/apps/user/job/job.route';
import listingRoutes from '@/apps/user/listing/listing.route';
import notificationRoutes from '@/apps/user/notification/notification.route';
import projectRoutes from '@/apps/user/project/project.route';

const router = express.Router();

// Unprotected routes (no auth middleware)
router.use(authRoutes);
router.use(companyRoutes);

// Protected routes (with auth middleware)
router.use(authMiddleware, brokerageRoutes);
router.use(authMiddleware, connectionRoutes);
router.use(authMiddleware, dashboardRoutes);
router.use(authMiddleware, developerRoutes);
router.use(authMiddleware, inquiryRoutes);
router.use(authMiddleware, notificationRoutes);
router.use(authMiddleware, projectRoutes);

export default (upload: multer.Multer) => {
    // Protected routes with upload middleware
    router.use(authMiddleware, brokerRoutes(upload));
    router.use(authMiddleware, jobRoutes(upload));
    router.use(authMiddleware, listingRoutes(upload));

    return router;
};
