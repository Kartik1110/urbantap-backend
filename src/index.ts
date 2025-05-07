// Internal Dependencies
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import express from "express";

import logger from "./utils/logger";
import { authMiddleware } from "./middlewares/auth.middleware";

// Routes
import jobRoutes from './app/jobs/job.route';
import authRoutes from "./app/auth/auth.route";
import adminRoutes from "./app/admin/admin.route";
import brokersRoutes from "./app/brokers/brokers.route";
import companyRoutes from "./app/company/company.route";
import listingsRoutes from "./app/listings/listings.route";
import inquiriesRoutes from './app/inquiries/inquiries.route';
import connectionsRoutes from './app/connections/connections.route';
import notificationsRoutes from './app/notifications/notifications.route';

dotenv.config();

const app = express();

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Unprotected routes
app.use("/api/v1", companyRoutes);
app.use("/api/v1", authRoutes);

// Protected routes
app.use("/api/v1", authMiddleware, notificationsRoutes);
app.use("/api/v1", authMiddleware, inquiriesRoutes);
app.use("/api/v1", authMiddleware, connectionsRoutes);

// File upload routes (also protected)
app.use("/api/v1", authMiddleware, brokersRoutes(upload));
app.use("/api/v1", authMiddleware, listingsRoutes(upload));
app.use("/api/v1", authMiddleware, jobRoutes(upload));

// Admin routes
app.use("/api/v1", authMiddleware, adminRoutes);

app.get("/health", (req, res) => {
  res.send("OK");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
