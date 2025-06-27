import { z } from "zod";

export const CompanyTypeEnum = z.enum(["Developer", "Brokerage", "Other"]);

export const bulkInsertCompaniesSchema = z.object({
  body: z.object({
    companies: z
      .array(
        z.object({
          name: z.string().min(1, "Company name is required"),
          name_ar: z.string().optional(), 
          description: z.string().optional(), 
          logo: z.string().optional(),
          type: CompanyTypeEnum.optional(),
          website: z.string().optional(), 
          email: z.string().email("Invalid company email").optional(),
          phone: z.string().optional(), 
          address: z.string().optional(),
        })
      )
      .min(1, "At least one company is required"),
  }),
});