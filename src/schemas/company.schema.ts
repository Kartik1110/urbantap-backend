import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(2),
  description: z.string().default(""),
  logo: z.string().url().default(""),
});

export type CreateCompanyInput = z.infer<typeof companySchema>;

export const bulkCompanySchema = z.object({
  companies: z.array(companySchema)
});

export type BulkCompanyInput = z.infer<typeof bulkCompanySchema>; 