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
import validateSchema from "../middlewares/validate.middleware";
import {
  getListingsSchema,
  postListingSchema,
  reportListingSchema,
} from "../schema/listing.schema";

const router = Router();

/* Get all listings */
router.get("/listings", validateSchema(getListingsSchema), getListings);

/* Get listing by id */
router.get("/listings/:id", getListingById);

/* Bulk insert listings */
export default (upload: any) => {
  router.post("/listings/bulk", upload.array("images"),validateSchema(postListingSchema), bulkInsertListings);

  router.put("/listings/:id",upload.array("images"),editListingController);

  /* Generate Listing from text */ 
  router.post("/listings/generate", generateListingFromText);

  return router;
};

/* Report a listing */
router.post(
  "/listings/report/:id",validateSchema(reportListingSchema),reportListing);

/* Delete Listing by id */
router.delete("/deletelisting" , deleteListing)