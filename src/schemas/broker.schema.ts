import { z } from "zod";

export const brokerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  info: z.string(),
  y_o_e: z.number().int().positive(),
  languages: z.array(z.string()),
  is_certified: z.boolean(),
  profile_pic: z.string().url(),
  w_number: z.string(),
  ig_link: z.string().optional(),
  linkedin_link: z.string().url().optional(),
  company_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
});

export const updateBrokerSchema = brokerSchema.partial();

export const bulkBrokerSchema = z.object({
  brokers: z.array(brokerSchema)
});

export type CreateBrokerInput = z.infer<typeof brokerSchema>;
export type UpdateBrokerInput = z.infer<typeof updateBrokerSchema>;
export type BulkBrokerInput = z.infer<typeof bulkBrokerSchema>; 