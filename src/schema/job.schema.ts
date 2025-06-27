import { z } from "zod";

export const WorkplaceTypeEnum = z.enum(["On_site", "Remote", "Hybrid"]); 
export const JobTypeEnum = z.enum(["Full_time", "Part_time", "Internship", "Contract"]); 
export const CurrencyEnum = z.enum(["USD", "INR", "AED"]);


export const jobSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"), 
    description: z.string().min(1, "Description is required"), 
    company_id: z.string().uuid("Invalid company ID"), 
    location: z.string().min(1, "Location is required"), 
    workplace_type: WorkplaceTypeEnum, 
    job_type: JobTypeEnum, 
    min_salary: z.number().optional(),
    max_salary: z.number().optional(), 
    currency: CurrencyEnum, 
    min_experience: z.number().int().optional(), 
    max_experience: z.number().int().optional(),
    userId: z.string().uuid().optional(),
  }),
});

export const applyJobSchema = z.object({
  body: z.object({
    jobId: z.string().trim().min(1, "Job ID is required"),
  }),
});

// Inferred types
export type JobInput = z.infer<typeof jobSchema>["body"];
export type ApplyJobInput = z.infer<typeof applyJobSchema>["body"];