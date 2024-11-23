import { z } from "zod";

const Category = z.enum(["Ready_to_move", "Off_plan", "Rent"]);
const Type = z.enum(["Apartment", "Villa", "Townhouse", "Office"]);
const RentalFrequency = z.enum(["Monthly", "Quarterly", "Yearly", "Lease"]);
const Furnished = z.enum(["Furnished", "Semi_furnished", "Unfurnished"]);
const City = z.enum([
  "Dubai",
  "Abu_Dhabi",
  "Sharjah",
  "Ajman",
  "Ras_Al_Khaimah",
  "Fujairah",
  "Umm_Al_Quwain",
]);
const Bedrooms = z.enum(["Studio", "One", "Two", "Three", "Four_Plus"]);
const Bathrooms = z.enum(["One", "Two", "Three_Plus"]);

export const listingSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  image: z.string().url(),
  min_price: z.number().nonnegative().optional(),
  max_price: z.number().nonnegative().optional(),
  sq_ft: z.number().positive().optional(),
  type: Type,
  category: Category,
  looking_for: z.boolean(),
  rental_frequency: RentalFrequency,
  no_of_bedrooms: Bedrooms.optional(),
  no_of_bathrooms: Bathrooms.optional(),
  furnished: Furnished,
  city: City,
  address: z.string().optional(),
  amenities: z.array(z.string()),
  image_urls: z.array(z.string().url()),
  broker_id: z.string().uuid(),
});

export type CreateListingInput = z.infer<typeof listingSchema>;

export const listingFiltersSchema = z.object({
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  min_sqft: z.number().optional(),
  max_sqft: z.number().optional(),
  type: Type.optional(),
  category: Category.optional(),
  city: City.optional(),
  furnished: Furnished.optional(),
  no_of_bedrooms: Bedrooms.optional(),
  no_of_bathrooms: Bathrooms.optional(),
}).partial();

export type ListingFilters = z.infer<typeof listingFiltersSchema>; 