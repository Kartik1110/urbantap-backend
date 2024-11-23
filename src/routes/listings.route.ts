import { Router } from "express";
import { z } from "zod";
import {
  getListings,
  bulkInsertListings,
} from "../controllers/listings.controller";
import { validateSchema } from "../middlewares/validate.middleware";
import { listingSchema, listingFiltersSchema } from "../schemas/listing.schema";
import { multipleFilesSchema } from "../schemas/file.schema";

const router = Router();

/* Get all listings */
router.get("/listings", validateSchema(z.object({
  query: listingFiltersSchema
})), getListings);

/* Bulk insert listings */
export default (upload: any) => {
  router.post(
    "/listings/bulk", 
    upload.array("images", 10),
    validateSchema(z.object({
      body: z.object({
        listings: z.array(listingSchema)
      }),
      files: multipleFilesSchema
    })),
    bulkInsertListings
  );
  return router;
};
