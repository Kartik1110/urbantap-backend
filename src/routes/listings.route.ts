import { Router } from "express";
import {
  getListings,
  bulkInsertListings,
  deleteListing,
  getListingById,
  reportListing,
  editListingController,
  generateListingFromText
} from "../controllers/listings.controller";

const router = Router();

/* Get all listings */
router.get("/listings", getListings);

router.get("/listings/:id", getListingById);

/* Bulk insert listings */
export default (upload: any) => {
  router.post("/listings/bulk", upload.array("images"), bulkInsertListings);

  router.put("/listings/:id",upload.array("images"),editListingController);

  /* Generate Listing from text */ 
  router.post("/listings/generate", generateListingFromText);

  return router;
};

/* Report a listing */
router.post("/listings/report/:id", reportListing);

/* Delete Listing by id */
router.delete("/deletelisting" , deleteListing)