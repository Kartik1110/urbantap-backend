import { z } from "zod";

export const RequestStatusEnum = z.enum(["Accepted", "Rejected", "Pending", "Blocked"]); 

export const createConnectionRequestSchema = z.object({
  params: z.object({
    broker_id: z.string().uuid(),
  }),
  body: z.object({
    sent_to_id: z.string().uuid(),
    text: z.string().optional(),
    status: RequestStatusEnum.optional(), 
  }),
});

export const updateConnectionRequestStatusSchema = z.object({
  params: z.object({
    broker_id: z.string().uuid(),
    request_id: z.string().uuid(),
  }),
  body: z.object({
    status: RequestStatusEnum,
  }),
});