import express from "express";
import dotenv from "dotenv";
import logger from "./utils/logger";
import brokersRoutes from "./routes/brokers.route";
import listingsRoutes from "./routes/listings.route";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", brokersRoutes);
app.use("/api/v1", listingsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
