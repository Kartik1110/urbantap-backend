import { z } from "zod";

// Schema for creating a connection request
export const createConnectionRequestSchema = z.object({
  params: z.object({
    broker_id: z.string().uuid(),
  }),
  body: z.object({
    sent_to_id: z.string().uuid(),
    text: z.string().optional(),
  }),
});

