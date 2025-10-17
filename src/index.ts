import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import express from 'express';
import logger from './utils/logger';
import './crons/listingApprovalCron';
import userRoutes from '@/apps/user';
import adminuserRoutes from '@/apps/admin';
import { connectDB } from './utils/prisma';

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

/* Admin User Routes */
app.use('/api/v1', adminuserRoutes(upload));

/* User Routes */
app.use('/api/v1', userRoutes(upload));

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
