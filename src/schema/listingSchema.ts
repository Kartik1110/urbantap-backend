import { z } from 'zod';
import {
    City,
    Category,
    Bedrooms,
    Bathrooms,
    Furnished,
    Payment_Plan,
    Rental_frequency,
    Type,
    Sale_Type,
    Type_of_use,
    DealType,
    CurrentStatus,
    Views,
    Market,
    Quarter
} from '@prisma/client';

export const createListingSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),

    description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),

    image: z.string().optional(),

    min_price: z
        .preprocess(val => (typeof val === 'string' ? parseFloat(val) : val), z.number().nonnegative())
        .optional(),

    max_price: z
        .preprocess(val => (typeof val === 'string' ? parseFloat(val) : val), z.number().nonnegative())
        .optional(),

    sq_ft: z
        .preprocess(val => (typeof val === 'string' ? parseFloat(val) : val), z.number().positive('Size must be positive'))
        .optional(),

    type: z.nativeEnum(Type, {
        errorMap: () => ({
            message: `Type must be one of: ${Object.values(Type).join(', ')}`
        }),
    }),

    category: z.nativeEnum(Category, {
        errorMap: () => ({
            message: `Category must be one of: ${Object.values(Category).join(', ')}`
        }),
    }),

    looking_for: z.preprocess(val => val === 'true' || val === true, z.boolean()),

    rental_frequency: z.nativeEnum(Rental_frequency).optional(),

    no_of_bedrooms: z.nativeEnum(Bedrooms).optional(),

    no_of_bathrooms: z.nativeEnum(Bathrooms).optional(),

    furnished: z.nativeEnum(Furnished).optional(),

    cheques: z
        .preprocess(val => (typeof val === 'string' ? parseInt(val) : val), z.number().int().nonnegative())
        .optional(),

    city: z.nativeEnum(City),

    address: z.string().max(500).optional(),

    handover_year: z
        .preprocess(val => (typeof val === 'string' ? parseInt(val) : val), z.number().int())
        .optional(),

    handover_quarter: z.nativeEnum(Quarter).optional(),


    type_of_use: z.nativeEnum(Type_of_use).optional(),

    deal_type: z.nativeEnum(DealType).optional(),

    current_status: z.nativeEnum(CurrentStatus).optional(),

    views: z.nativeEnum(Views).optional(),

    market: z.nativeEnum(Market).optional(),

    parking_space: z
        .preprocess(val => val === 'true' || val === true, z.boolean())
        .optional(),

    service_charge: z
        .preprocess(val => (typeof val === 'string' ? parseInt(val) : val), z.number().int())
        .optional(),

    construction_progress: z
        .preprocess(val => (typeof val === 'string' ? parseInt(val) : val), z.number().int())
        .optional(),

    gfa_bua: z
        .preprocess(val => (typeof val === 'string' ? parseInt(val) : val), z.number().int())
        .optional(),

    floor_area_ratio: z
        .preprocess(val => (typeof val === 'string' ? parseFloat(val) : val), z.number())
        .optional(),

    latitude: z
        .preprocess(val => (typeof val === 'string' ? parseFloat(val) : val), z.number())
        .optional(),

    longitude: z
        .preprocess(val => (typeof val === 'string' ? parseFloat(val) : val), z.number())
        .optional(),

    locality: z.string().optional(),

    amenities: z
        .preprocess(val => (typeof val === 'string' ? JSON.parse(val) : val), z.array(z.string()))
        .optional(),

    image_urls: z
        .preprocess(val => (typeof val === 'string' ? JSON.parse(val) : val), z.array(z.string()).max(20))
        .optional(),

    project_age: z
        .preprocess(val => (typeof val === 'string' ? parseInt(val) : val), z.number().int())
        .optional(),

    payment_plan: z.nativeEnum(Payment_Plan).optional(),

    sale_type: z.nativeEnum(Sale_Type).optional(),

    broker_id: z.string().min(1, 'Broker ID is required')
});

//  Bulk Listing Schema
export const bulkListingsSchema = z.object({
    listings: z.preprocess(
        val => (typeof val === 'string' ? JSON.parse(val) : val),
        z.array(createListingSchema).min(1, 'At least one listing is required')
    )
});
