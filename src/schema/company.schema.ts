// src/schemas/company.schema.ts
import { z } from "zod";

export const bulkInsertCompaniesSchema = z.object({
  body: z.object({
    companies: z
      .array(
        z.object({
          name: z.string().min(1, "Company name is required"),
          email: z.string().email("Invalid company email"),
          phone: z.string().min(1, "Phone number is required"),
          address: z.string().optional(), // or required, depending on your DB model
        })
      )
      .min(1, "At least one company is required"),
  }),
});