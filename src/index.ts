import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import express from 'express';
import logger from './utils/logger';
import './crons/listingApprovalCron';
import jobRoutes from './routes/job.route';
import { connectDB } from './utils/prisma';
import adminuserRoutes from '@/apps/admin';
import authRoutes from './routes/auth.route';
import adminRoutes from './routes/admin.route';
import projectRoutes from './routes/project.route';
import companyRoutes from './routes/company.route';
import brokersRoutes from './routes/brokers.route';
import listingsRoutes from './routes/listings.route';
import developerRoutes from './routes/developer.route';
import inquiriesRoutes from './routes/inquiries.route';
import brokerageRoutes from './routes/brokerage.route';
import dashboardRoutes from './routes/dashboard.route';
import connectionsRoutes from './routes/connections.route';
import notificationsRoutes from './routes/notifications.route';
import { authMiddleware } from './middlewares/auth.middleware';

dotenv.config();

const app = express();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Unprotected routes
app.use('/api/v1', companyRoutes);
app.use('/api/v1', authRoutes);

/* Admin User Routes */
app.use('/api/v1', adminuserRoutes(upload));

// Protected routes
app.use('/api/v1', authMiddleware, notificationsRoutes);
app.use('/api/v1', authMiddleware, inquiriesRoutes);
app.use('/api/v1', authMiddleware, connectionsRoutes);
app.use('/api/v1', authMiddleware, developerRoutes);
app.use('/api/v1', authMiddleware, projectRoutes);
app.use('/api/v1', authMiddleware, brokerageRoutes);
app.use('/api/v1', authMiddleware, dashboardRoutes);

// File upload routes (also protected)
app.use('/api/v1', authMiddleware, brokersRoutes(upload));
app.use('/api/v1', authMiddleware, listingsRoutes(upload));
app.use('/api/v1', authMiddleware, jobRoutes(upload));

// Admin routes
app.use('/api/v1', authMiddleware, adminRoutes);

app.get('/health', (req, res) => {
    res.send('OK');
});

const PORT = process.env.PORT || 5000;

// Initialize database connection and start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
