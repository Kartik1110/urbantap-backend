import { z } from "zod";
import {
City,
Category,
Rental_frequency,
Payment_Plan,
Sale_Type,
Type,
Bedrooms,
Bathrooms,
Furnished,
Admin_Status
} from "@prisma/client";

export const editListingSchema = z.object({
title: z.string().optional(),
description: z.string().optional(),
image: z.string().url().optional(),
min_price: z.number().optional(),
max_price: z.number().optional(),
sq_ft: z.number().optional(),
type: z.nativeEnum(Type).optional(),
category: z.nativeEnum(Category).optional(),
looking_for: z.boolean().optional(),
rental_frequency: z.nativeEnum(Rental_frequency).optional(),
no_of_bedrooms: z.nativeEnum(Bedrooms).optional(),
no_of_bathrooms: z.nativeEnum(Bathrooms).optional(),
furnished: z.nativeEnum(Furnished).optional(),
city: z.nativeEnum(City).optional(),
address: z.string().optional(),
amenities: z.array(z.string()).optional(),
image_urls: z.array(z.string().url()).optional(),
project_age: z.number().optional(),
payment_plan: z.nativeEnum(Payment_Plan).optional(),
sale_type: z.nativeEnum(Sale_Type).optional(),
admin_status: z.nativeEnum(Admin_Status).optional(),
}).strict();