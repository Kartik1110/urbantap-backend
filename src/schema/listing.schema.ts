// src/schemas/listing.schema.ts
import { z } from "zod";
import { City } from "@prisma/client";

// Get Listings Filters Schema (for filters in body)
export const getListingsSchema = z.object({
  body: z.object({
    looking_for: z.boolean().optional(),
    category: z.enum(["Ready_to_move", "Off_plan", "Rent"]).optional(),
    min_price: z.number().optional(),
    max_price: z.number().optional(),
    min_sqft: z.number().min(100).optional(),
    max_sqft: z.number().min(100).optional(),
    city: z.nativeEnum(City).optional(),
    address: z.string().optional(),
    no_of_bathrooms: z.array(z.string()).optional(),
    no_of_bedrooms: z.array(z.string()).optional(),
    furnished: z.array(z.string()).optional(),
    type: z.array(z.string()).optional(),
    rental_frequency: z.array(z.string()).optional(),
    project_age: z.array(z.enum(["Less_than_5_years", "More_than_5_years"])).optional(),
    payment_plan: z.array(z.enum(["Payment_done", "Payment_Pending"])).optional(),
    sale_type: z.array(z.enum(["Direct", "Resale"])).optional(),
    amenities: z.array(z.string()).optional(),
    page: z.number().optional(),
    page_size: z.number().optional(),
  }).strict(),
});

// Bulk Insert Listings (images will come separately via multer, but listings are JSON stringified)
export const bulkInsertListingsSchema = z.object({
  body: z.object({
    listings: z.string(), 
  }).strict(),
});

// Get Listing by ID
export const getListingByIdSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

// Report Listing
export const reportListingSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    reason: z.string(),
    description: z.string(),
    brokerId: z.string(),
  }).strict(),
});

// Delete Listing
export const deleteListingSchema = z.object({
  body: z.object({
    listingId: z.string(),
    brokerId: z.string(),
  }).strict(),
});