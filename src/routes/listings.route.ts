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
import validateSchema, { validateJsonField } from "../middlewares/validate.middleware";
import { editListingSchema } from "../schema/editListings.schema";
import { z } from "zod";

const router = Router();

// Schema for listing ID parameter validation
const listingIdSchema = z.object({
  id: z.string().uuid("Invalid listing ID format")
});

// Schema for report listing
const reportListingSchema = z.object({
  reason: z.string().min(1, "Reason cannot be empty").max(500, "Reason too long"),
  description: z.string().max(1000, "Description too long").optional()
});

// Schema for delete listing
const deleteListingSchema = z.object({
  listingId: z.string().uuid("Invalid listing ID format"),
  brokerId: z.string().uuid("Invalid broker ID format")
});

/* Get all listings */
router.get("/listings", getListings);

router.get("/listings/:id", getListingById);

/* Bulk insert listings */
export default (upload: any) => {
  router.post("/listings/bulk", upload.array("images"), bulkInsertListings);

  // Apply validation middleware to edit listing endpoint
  // This validates the 'listing' field in multipart form data as JSON
  router.put(
    "/listings/:id",
    upload.array("images"),
    validateJsonField(editListingSchema, "listing"), // Validate the 'listing' field as JSON
    editListingController
  );

  /* Generate Listing from text */ 
  router.post("/listings/generate", generateListingFromText);

  return router;
};

/* Report a listing - with validation */
router.post(
  "/listings/report/:id", 
  validateSchema(reportListingSchema), // Validate request body
  reportListing
);

/* Delete Listing by id - with validation */
router.delete(
  "/deletelisting",
  validateSchema(deleteListingSchema), // Validate request body
  deleteListing
);