import { z } from "zod";

export const fileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().regex(/^image\/(jpeg|png|jpg)$/),
  size: z.number().max(5 * 1024 * 1024), // 5MB max
  destination: z.string(),
  filename: z.string(),
  path: z.string(),
});

export const multipleFilesSchema = z.array(fileSchema);

export type FileInput = z.infer<typeof fileSchema>;
export type MultipleFilesInput = z.infer<typeof multipleFilesSchema>; 