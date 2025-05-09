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

// Schema for updating connection request status
export const updateConnectionRequestStatusSchema = z.object({
  params: z.object({
    broker_id: z.string().uuid(),
    request_id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum(["Accepted", "Rejected"]),
  }),
});