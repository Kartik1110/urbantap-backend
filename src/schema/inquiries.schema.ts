import { z } from "zod";

export const createInquirySchema = z.object({
  body: z.object({
    text: z.string().min(1, "Inquiry text is required."), 
    sent_by_id: z.string().uuid("sent_by_id must be a valid UUID."),
    sent_to_id: z.string().uuid("sent_to_id must be a valid UUID."), 
    email: z.string().email("Must be a valid email address."),
    name: z.string().min(1, "Name is required."),
    phone_no: z.string().min(5, "Phone number is required."),
    country_code: z.string().min(1, "Country code is required."),
  }),
  params: z.object({
    listing_id: z.string().uuid("listing_id must be a valid UUID."),
  }),
});