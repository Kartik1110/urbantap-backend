import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import logger from "./utils/logger";
import brokersRoutes from "./routes/brokers.route";
import listingsRoutes from "./routes/listings.route";
import companyRoutes from "./routes/company.route";
import authRoutes from "./routes/auth.route";
import { authMiddleware } from "./middlewares/auth.middleware";
import notificationsRoutes from './routes/notifications.route';
import inquiriesRoutes from './routes/inquiries.route';
import connectionsRoutes from './routes/connections.route';
import { requestLogger } from "./middlewares/logger.middleware";
import { errorHandler } from "./middlewares/error.middleware";

dotenv.config();

const app = express();

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logger middleware
app.use(requestLogger);

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

app.get("/health", (req, res) => {
  res.send("OK");
});

// Handle 404 errors
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`) as any;
  err.statusCode = 404;
  err.status = 'fail';
  next(err);
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
