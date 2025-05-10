import { z } from "zod";
import { NotificationType } from "@prisma/client";

export const NotificationSchema = z.object({
  token: z.string().optional(),
  topic: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  data: z.object({
    broker_id: z.string().optional(),
    type: z.nativeEnum(NotificationType).optional(),
    sent_by_id: z.string().nullable().optional(),
    listing_id: z.string().nullable().optional(),
    inquiry_id: z.string().nullable().optional(),
    connectionRequest_id: z.string().nullable().optional(),
  }).optional()
}).refine((body) => body.token || body.topic, {
  message: "Either token or topic must be provided",
  path: ["token", "topic"]
});
