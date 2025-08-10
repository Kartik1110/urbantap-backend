import { z } from 'zod';

export const editProfileSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(255, 'Name must be less than 255 characters')
        .optional(),

    description: z
        .string()
        .min(1, 'Description is required')
        .max(2000, 'Description must be less than 2000 characters')
        .optional(),

    email: z
        .string()
        .email('Must be a valid email')
        .optional()
        .or(z.literal('').transform(() => undefined)),

    phone: z
        .string()
        .min(10, 'Phone must be at least 10 digits')
        .max(20, 'Phone must be less than 20 digits')
        .optional()
        .or(z.literal('').transform(() => undefined)),

    ded: z.string().optional(),
    rera: z.string().optional(),
    service_areas: z.array(z.string()).optional(),
});
