import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";

import logger from "./utils/logger";
import { authMiddleware } from "./middlewares/auth.middleware";

import brokersRoutes from "./routes/brokers.route";
import listingsRoutes from "./routes/listings.route";
import companyRoutes from "./routes/company.route";
import authRoutes from "./routes/auth.route";
import notificationsRoutes from './routes/notifications.route';
import inquiriesRoutes from './routes/inquiries.route';
import connectionsRoutes from './routes/connections.route';
import jobRoutes from './routes/job.route';

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

app.get("/health", (req, res) => {
  res.send("OK");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
