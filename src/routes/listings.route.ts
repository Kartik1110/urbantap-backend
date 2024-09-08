import { Router } from "express";
import {
  getListings,
  bulkInsertListings,
} from "../controllers/listings.controller";

const router = Router();

/* Get all listings */
router.get("/listings", getListings);

/* Bulk insert listings */
router.post("/listings/bulk", bulkInsertListings);

export default router;
