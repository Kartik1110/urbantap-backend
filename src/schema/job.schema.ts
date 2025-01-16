import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  companyId: z.string().min(1, "Company ID is required"),
  location: z.string().min(1, "Location is required"),
  workplaceType: z.enum(["On_site", "Remote", "Hybrid"]),
  jobType: z.enum(["Full_time", "Part_time", "Internship", "Contract"]),
});

export type JobInput = z.infer<typeof jobSchema>;
