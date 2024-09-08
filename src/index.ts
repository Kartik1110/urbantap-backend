import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import logger from "./utils/logger";
import brokersRoutes from "./routes/brokers.route";
import listingsRoutes from "./routes/listings.route";
import companyRoutes from "./routes/company.route";

dotenv.config();

const app = express();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add multer middleware to routes that need file upload
app.use("/api/v1", brokersRoutes(upload));
app.use("/api/v1", listingsRoutes(upload));
app.use("/api/v1", companyRoutes);

app.get("/health", (req, res) => {
  res.send("OK");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
