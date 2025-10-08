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

// Floor plan schema for validation
const floorPlanSchema = z.object({
    title: z.string().min(1, 'Floor plan title is required'),
    min_price: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z.number().positive().nullable().optional()
    ),
    max_price: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z.number().positive().nullable().optional()
    ),
    unit_size: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z.number().positive().optional()
    ),
    bedrooms: z.nativeEnum(Bedrooms),
    bathrooms: z.preprocess(
        (val) => (val === null || val === undefined ? undefined : val),
        z.nativeEnum(Bathrooms).optional()
    ),
});

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

    furnished: z.nativeEnum(Furnished, {
        errorMap: () => ({
            message: `Furnished must be one of: ${Object.values(Furnished).join(', ')}`,
        }),
    }),

    unit_types: z.preprocess(
        (val) => (typeof val === 'string' ? JSON.parse(val) : val),
        z
            .array(z.string().min(1, 'Unit type cannot be empty'))
            .min(1, 'At least one unit type is required')
            .max(50, 'Too many unit types (max 50)')
    ),

    amenities: z
        .preprocess(
            (val) => (typeof val === 'string' ? JSON.parse(val) : val),
            z
                .array(z.nativeEnum(Amenities))
                .max(50, 'Too many amenities (max 50)')
        )
        .optional(),

    handover_year: z
        .preprocess(
            (val) => (typeof val === 'string' ? parseInt(val) : val),
            z
                .number()
                .int('Handover year must be an integer')
                .min(2020, 'Handover year must be 2020 or later')
                .max(2050, 'Handover year must be 2050 or earlier')
        )
        .optional(),

    min_bedrooms: z
        .nativeEnum(Bedrooms, {
            errorMap: () => ({
                message: `Min bedrooms must be one of: ${Object.values(Bedrooms).join(', ')}`,
            }),
        })
        .optional(),

    max_bedrooms: z
        .nativeEnum(Bedrooms, {
            errorMap: () => ({
                message: `Max bedrooms must be one of: ${Object.values(Bedrooms).join(', ')}`,
            }),
        })
        .optional(),

    // Payment plan structure from frontend (percentage breakdown)
    payment_structure: z
        .preprocess(
            (val) => (typeof val === 'string' ? JSON.parse(val) : val),
            z.object({
                one: z.string().refine((val) => {
                    const num = Number(val);
                    return !isNaN(num) && num >= 0 && num <= 100;
                }, 'Must be a valid number between 0 and 100'),
                two: z.string().refine((val) => {
                    const num = Number(val);
                    return !isNaN(num) && num >= 0 && num <= 100;
                }, 'Must be a valid number between 0 and 100'),
                three: z.string().refine((val) => {
                    const num = Number(val);
                    return !isNaN(num) && num >= 0 && num <= 100;
                }, 'Must be a valid number between 0 and 100'),
                four: z.string().refine((val) => {
                    const num = Number(val);
                    return !isNaN(num) && num >= 0 && num <= 100;
                }, 'Must be a valid number between 0 and 100'),
            })
        )
        .optional(),

    // Floor plans data from frontend
    floor_plans: z
        .preprocess(
            (val) => (typeof val === 'string' ? JSON.parse(val) : val),
            z.array(floorPlanSchema).optional()
        )
        .optional(),

    // Latitude and longitude for location
    latitude: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z
            .number()
            .min(-90, 'Latitude must be between -90 and 90')
            .max(90, 'Latitude must be between -90 and 90')
            .optional()
    ),

    longitude: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z
            .number()
            .min(-180, 'Longitude must be between -180 and 180')
            .max(180, 'Longitude must be between -180 and 180')
            .optional()
    ),
});

// Update schema - all fields are optional for updates
export const updateProjectSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(255, 'Title must be less than 255 characters')
        .optional(),

    description: z
        .string()
        .min(1, 'Description is required')
        .max(2000, 'Description must be less than 2000 characters')
        .optional(),

    min_price: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z
            .number()
            .positive('Min price must be positive')
            .max(1_000_000_000, 'Min price seems unreasonably high')
            .optional()
    ),

    currency: z
        .nativeEnum(Currency, {
            errorMap: () => ({
                message: `Currency must be one of: ${Object.values(Currency).join(', ')}`,
            }),
        })
        .optional(),

    address: z
        .string()
        .min(1, 'Address is required')
        .max(500, 'Address must be less than 500 characters')
        .optional(),

    city: z
        .nativeEnum(City, {
            errorMap: () => ({
                message: `City must be one of: ${Object.values(City).join(', ')}`,
            }),
        })
        .optional(),

    category: z
        .nativeEnum(Category, {
            errorMap: () => ({
                message: `Category must be one of: ${Object.values(Category).join(', ')}`,
            }),
        })
        .optional(),

    type: z
        .preprocess(
            (val) => (typeof val === 'string' ? JSON.parse(val) : val),
            z
                .array(z.nativeEnum(Type))
                .min(1, 'At least one type is required')
                .max(10, 'Too many types (max 10)')
        )
        .optional(),

    project_name: z
        .string()
        .min(1, 'Project name is required')
        .max(255, 'Project name must be less than 255 characters')
        .optional(),

    project_age: z
        .string()
        .min(1, 'Project age is required')
        .max(100, 'Project age must be less than 100 characters')
        .optional(),

    furnished: z
        .nativeEnum(Furnished, {
            errorMap: () => ({
                message: `Furnished must be one of: ${Object.values(Furnished).join(', ')}`,
            }),
        })
        .optional(),

    unit_types: z
        .preprocess(
            (val) => (typeof val === 'string' ? JSON.parse(val) : val),
            z
                .array(z.string().min(1, 'Unit type cannot be empty'))
                .min(1, 'At least one unit type is required')
                .max(50, 'Too many unit types (max 50)')
        )
        .optional(),

    amenities: z
        .preprocess(
            (val) => (typeof val === 'string' ? JSON.parse(val) : val),
            z
                .array(z.nativeEnum(Amenities))
                .max(50, 'Too many amenities (max 50)')
        )
        .optional(),

    handover_year: z
        .preprocess(
            (val) => (typeof val === 'string' ? parseInt(val) : val),
            z
                .number()
                .int('Handover year must be an integer')
                .min(2020, 'Handover year must be 2020 or later')
                .max(2050, 'Handover year must be 2050 or earlier')
        )
        .optional(),

    min_bedrooms: z
        .nativeEnum(Bedrooms, {
            errorMap: () => ({
                message: `Min bedrooms must be one of: ${Object.values(Bedrooms).join(', ')}`,
            }),
        })
        .optional(),

    max_bedrooms: z
        .nativeEnum(Bedrooms, {
            errorMap: () => ({
                message: `Max bedrooms must be one of: ${Object.values(Bedrooms).join(', ')}`,
            }),
        })
        .optional(),

    // Payment plan structure from frontend (percentage breakdown)
    payment_structure: z
        .preprocess(
            (val) => (typeof val === 'string' ? JSON.parse(val) : val),
            z.object({
                one: z.string().refine((val) => {
                    const num = Number(val);
                    return !isNaN(num) && num >= 0 && num <= 100;
                }, 'Must be a valid number between 0 and 100'),
                two: z.string().refine((val) => {
                    const num = Number(val);
                    return !isNaN(num) && num >= 0 && num <= 100;
                }, 'Must be a valid number between 0 and 100'),
                three: z.string().refine((val) => {
                    const num = Number(val);
                    return !isNaN(num) && num >= 0 && num <= 100;
                }, 'Must be a valid number between 0 and 100'),
                four: z.string().refine((val) => {
                    const num = Number(val);
                    return !isNaN(num) && num >= 0 && num <= 100;
                }, 'Must be a valid number between 0 and 100'),
            })
        )
        .optional(),

    // Floor plans data from frontend
    floor_plans: z
        .preprocess(
            (val) => (typeof val === 'string' ? JSON.parse(val) : val),
            z.array(floorPlanSchema).optional()
        )
        .optional(),

    // For updates - existing image URLs to keep
    existing_image_urls: z
        .preprocess(
            (val) => (typeof val === 'string' ? JSON.parse(val) : val),
            z.array(z.string()).optional()
        )
        .optional(),

    // Latitude and longitude for location
    latitude: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z
            .number()
            .min(-90, 'Latitude must be between -90 and 90')
            .max(90, 'Latitude must be between -90 and 90')
            .optional()
    ),

    longitude: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z
            .number()
            .min(-180, 'Longitude must be between -180 and 180')
            .max(180, 'Longitude must be between -180 and 180')
            .optional()
    ),
});
