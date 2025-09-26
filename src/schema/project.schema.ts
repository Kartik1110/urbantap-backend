import { z } from 'zod';
import {
    City,
    Category,
    Bedrooms,
    Bathrooms,
    Furnished,
    Payment_Plan,
    Currency,
    Type,
    Amenities,
} from '@prisma/client';

export const createProjectSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(255, 'Title must be less than 255 characters'),

    description: z
        .string()
        .min(1, 'Description is required')
        .max(2000, 'Description must be less than 2000 characters'),

    min_price: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z
            .number()
            .positive('Min price must be positive')
            .max(1_000_000_000, 'Min price seems unreasonably high')
            .optional()
    ),

    max_price: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z
            .number()
            .positive('Max price must be positive')
            .max(1_000_000_000, 'Max price seems unreasonably high')
            .optional()
    ),

    currency: z.nativeEnum(Currency, {
        errorMap: () => ({
            message: `Currency must be one of: ${Object.values(Currency).join(', ')}`,
        }),
    }),

    address: z
        .string()
        .min(1, 'Address is required')
        .max(500, 'Address must be less than 500 characters'),

    city: z.nativeEnum(City, {
        errorMap: () => ({
            message: `City must be one of: ${Object.values(City).join(', ')}`,
        }),
    }),

    category: z.nativeEnum(Category, {
        errorMap: () => ({
            message: `Category must be one of: ${Object.values(Category).join(', ')}`,
        }),
    }),

    type: z.preprocess(
        (val) => (typeof val === 'string' ? JSON.parse(val) : val),
        z
            .array(z.nativeEnum(Type))
            .min(1, 'At least one type is required')
            .max(10, 'Too many types (max 10)')
    ),

    project_name: z
        .string()
        .min(1, 'Project name is required')
        .max(255, 'Project name must be less than 255 characters'),

    project_age: z
        .string()
        .min(1, 'Project age is required')
        .max(100, 'Project age must be less than 100 characters'),

    min_bedrooms: z.nativeEnum(Bedrooms, {
        errorMap: () => ({
            message: `Min bedrooms must be one of: ${Object.values(Bedrooms).join(', ')}`,
        }),
    }).optional(),

    max_bedrooms: z.nativeEnum(Bedrooms, {
        errorMap: () => ({
            message: `Max bedrooms must be one of: ${Object.values(Bedrooms).join(', ')}`,
        }),
    }).optional(),

    min_bathrooms: z.nativeEnum(Bathrooms, {
        errorMap: () => ({
            message: `Min bathrooms must be one of: ${Object.values(Bathrooms).join(', ')}`,
        }),
    }).optional(),

    max_bathrooms: z.nativeEnum(Bathrooms, {
        errorMap: () => ({
            message: `Max bathrooms must be one of: ${Object.values(Bathrooms).join(', ')}`,
        }),
    }).optional(),

    furnished: z.nativeEnum(Furnished, {
        errorMap: () => ({
            message: `Furnished must be one of: ${Object.values(Furnished).join(', ')}`,
        }),
    }),

    min_sq_ft: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z
            .number()
            .positive('Min sq ft must be positive')
            .max(1_000_000, 'Min sq ft seems unreasonably high')
    ).optional(),

    max_sq_ft: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z
            .number()
            .positive('Max sq ft must be positive')
            .max(1_000_000, 'Max sq ft seems unreasonably high')
    ).optional(),

    property_size: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z
            .number()
            .positive('Property size must be positive')
            .max(1_000_000, 'Property size seems unreasonably high')
    ).optional(),

    payment_structure: z
        .string()
        .max(500, 'Payment structure must be less than 500 characters')
        .optional(),

    handover_year: z.preprocess(
        (val) => (typeof val === 'string' ? parseInt(val) : val),
        z
            .number()
            .int('Handover year must be an integer')
            .min(2020, 'Handover year must be 2020 or later')
            .max(2050, 'Handover year must be 2050 or earlier')
    ).optional(),

    payment_plan: z.nativeEnum(Payment_Plan, {
        errorMap: () => ({
            message: `Payment plan must be one of: ${Object.values(Payment_Plan).join(', ')}`,
        }),
    }).optional(),

    unit_types: z.preprocess(
        (val) => (typeof val === 'string' ? JSON.parse(val) : val),
        z
            .array(z.string().min(1, 'Unit type cannot be empty'))
            .max(50, 'Too many unit types (max 50)')
    ),

    amenities: z.preprocess(
        (val) => (typeof val === 'string' ? JSON.parse(val) : val),
        z
            .array(z.nativeEnum(Amenities))
            .max(50, 'Too many amenities (max 50)')
    ).optional(),
});
