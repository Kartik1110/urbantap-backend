import { Router } from "express";
import {
  getListings,
  bulkInsertListings,
  deleteListing,
  getListingById,
} from "../controllers/listings.controller";

const router = Router();

/* Get all listings */
router.get("/listings", getListings);

router.get("/listings/:id", getListingById);

/* Bulk insert listings */
export default (upload: any) => {
  router.post("/listings/bulk", upload.array("images"), bulkInsertListings);
  return router;
};

/* Delete Listing by id */
router.delete("/deletelisting" , deleteListing)
