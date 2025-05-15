import { Router } from "express";
import {
  getListings,
  bulkInsertListings,
  deleteListing,
  getListingById,
  reportListing,
  editListingController
} from "../controllers/listings.controller";
import validateSchema from "../middlewares/validate.middleware";
import {
  getListingsSchema,
  bulkInsertListingsSchema,
  getListingByIdSchema,
  reportListingSchema,
  deleteListingSchema,
} from "../schema/listing.schema";

const router = Router();

/* Get all listings */
router.get("/listings", getListings);

router.get("/listings/:id", getListingById);

/* Bulk insert listings */
export default (upload: any) => {
  router.post("/listings/bulk", upload.array("images"), bulkInsertListings);

  router.put("/listings/:id",upload.array("images"),editListingController);

  return router;
};

/* Report a listing */
router.post("/listings/report/:id", reportListing);

/* Delete Listing by id */
router.delete("/deletelisting" , deleteListing)
