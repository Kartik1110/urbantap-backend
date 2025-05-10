import { z } from "zod";
export const jobSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    companyId: z.string().min(1, "Company ID is required"),
    location: z.string().min(1, "Location is required"),
    workplaceType: z.enum(["On_site", "Remote", "Hybrid"]),
    jobType: z.enum(["Full_time", "Part_time", "Internship", "Contract"]),
  }),
});
// Job application schema (wrapped in body for consistency)
export const applyJobSchema = z.object({
  body: z.object({
    jobId: z.string().trim().min(1, "Job ID is required"),
  }),
});

// Inferred types
export type JobInput = z.infer<typeof jobSchema>["body"];
export type ApplyJobInput = z.infer<typeof applyJobSchema>["body"];