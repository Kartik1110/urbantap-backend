import { Router } from "express";
import {
  getListings,
  bulkInsertListings,
  deleteListing,
  getListingById,
  reportListing,
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

/* Report a listing */
router.post("/listings/report/:id", reportListing);

/* Delete Listing by id */
router.delete("/deletelisting" , deleteListing)
