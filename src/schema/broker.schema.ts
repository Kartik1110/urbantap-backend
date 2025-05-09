import { z } from "zod";



export const blockBrokerSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid broker ID in URL"),
  }),
  body: z.object({
    broker_id: z.string().uuid("Invalid broker ID in body"),
    action: z.string().min(1, "Action is required"),
  }),
});

// This schema is used AFTER JSON.parse(req.body.data)
export const updateBrokerDataSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company_id: z.string().uuid().optional(),
  // add other fields as needed based on your data model
});

// Used AFTER JSON.parse(req.body.brokers)
export const bulkInsertBrokersSchema = z.object({
  brokers: z
    .array(
      z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string(),
        company_id: z.string().uuid().optional(),
      })
    )
    .min(1),
});