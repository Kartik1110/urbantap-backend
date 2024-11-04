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
import notificationsRoutes from './routes/notifications.routes';

dotenv.config();

const app = express();

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", companyRoutes);
app.use("/api/v1", authRoutes);

app.use("/api/v1", notificationsRoutes);

// Add multer middleware to routes that need file upload
app.use("/api/v1", authMiddleware, brokersRoutes(upload));
app.use("/api/v1", authMiddleware, listingsRoutes(upload));


app.get("/health", (req, res) => {
  res.send("OK");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
