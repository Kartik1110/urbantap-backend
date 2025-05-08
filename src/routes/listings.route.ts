import { Router } from "express";
import {
  getListings,
  bulkInsertListings,
  deleteListing,
  getListingById,
  reportListing,
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
router.get("/listings", validateSchema(getListingsSchema), getListings);

/* Get listing by id */
router.get("/listings/:id", validateSchema(getListingByIdSchema), getListingById);

/* Bulk insert listings */
export default (upload: any) => {
  router.post("/listings/bulk",upload.array("images"),validateSchema(bulkInsertListingsSchema),bulkInsertListings);
  return router;
};

/* Report a listing */
router.post(
  "/listings/report/:id",validateSchema(reportListingSchema),reportListing);

/* Delete Listing by id */
router.delete("/deletelisting",validateSchema(deleteListingSchema),deleteListing);
