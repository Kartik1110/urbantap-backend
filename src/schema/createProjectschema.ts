import { z } from 'zod';
import {
    City,
    Category,
    Bedrooms,
    Bathrooms,
    Furnished,
    Payment_Plan,
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

    price: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z
            .number()
            .positive('Price must be positive')
            .min(1000, 'Price must be at least 3 digits (minimum 1000)')
            .max(1_000_000_000, 'Price seems unreasonably high')
    ),

    address: z
        .string()
        .min(1, 'Address is required')
        .max(500, 'Address must be less than 500 characters'),

    city: z.nativeEnum(City, {
        errorMap: () => ({
            message: `City must be one of: ${Object.values(City).join(', ')}`,
        }),
    }),

    type: z.nativeEnum(Category, {
        errorMap: () => ({
            message: `Type must be one of: ${Object.values(Category).join(', ')}`,
        }),
    }),

    project_name: z
        .string()
        .min(1, 'Project name is required')
        .max(255, 'Project name must be less than 255 characters'),

    project_age: z
        .string()
        .min(1, 'Project age is required')
        .max(100, 'Project age must be less than 100 characters'),

    no_of_bedrooms: z.nativeEnum(Bedrooms, {
        errorMap: () => ({
            message: `Bedrooms must be one of: ${Object.values(Bedrooms).join(', ')}`,
        }),
    }),

    no_of_bathrooms: z.nativeEnum(Bathrooms, {
        errorMap: () => ({
            message: `Bathrooms must be one of: ${Object.values(Bathrooms).join(', ')}`,
        }),
    }),

    furnished: z.nativeEnum(Furnished, {
        errorMap: () => ({
            message: `Furnished must be one of: ${Object.values(Furnished).join(', ')}`,
        }),
    }),

    property_size: z.preprocess(
        (val) => (typeof val === 'string' ? parseFloat(val) : val),
        z
            .number()
            .positive('Property size must be positive')
            .max(1_000_000, 'Property size seems unreasonably high')
    ),

    payment_plan: z.nativeEnum(Payment_Plan, {
        errorMap: () => ({
            message: `Payment plan must be one of: ${Object.values(Payment_Plan).join(', ')}`,
        }),
    }),

    unit_types: z.preprocess(
        (val) => (typeof val === 'string' ? JSON.parse(val) : val),
        z
            .array(z.string().min(1, 'Unit type cannot be empty'))
            .max(50, 'Too many unit types (max 50)')
    ),

    amenities: z.preprocess(
        (val) => (typeof val === 'string' ? JSON.parse(val) : val),
        z
            .array(z.string().min(1, 'Amenity cannot be empty'))
            .max(50, 'Too many amenities (max 50)')
    ),
});
