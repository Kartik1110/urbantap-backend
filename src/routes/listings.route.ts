import { Router } from "express";
import {
  getListings,
  bulkInsertListings,
} from "../controllers/listings.controller";

const router = Router();

router.get("/listings", getListings);
router.post("/listings/bulk", bulkInsertListings);

export default router;
