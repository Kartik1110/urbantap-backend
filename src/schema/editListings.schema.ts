import { z } from 'zod';
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
    Admin_Status,
    Quarter,
    Type_of_use,
    DealType,
    CurrentStatus,
    Views,
    Market,
} from '@prisma/client';

export const editListingSchema = z
    .object({
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
        cheques: z.number().optional(),
        city: z.nativeEnum(City).optional(),
        address: z.string().optional(),
        handoverYear: z.number().optional(),
        handoverQuarter: z.nativeEnum(Quarter).optional(),
        Type_of_use: z.nativeEnum(Type_of_use).optional(),
        DealType: z.nativeEnum(DealType).optional(),
        CurrentStatus: z.nativeEnum(CurrentStatus).optional(),
        Views: z.nativeEnum(Views).optional(),
        Market: z.nativeEnum(Market).optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        amenities: z.array(z.string()).optional(),
        image_urls: z.array(z.string().url()).optional(),
        project_age: z.number().optional(),
        payment_plan: z.nativeEnum(Payment_Plan).optional(),
        sale_type: z.nativeEnum(Sale_Type).optional(),
        admin_status: z.nativeEnum(Admin_Status).optional(),
        parking_space: z.boolean().optional(),
        service_charge: z.number().optional(),
        construction_progress: z.number().optional(),
        gfa_bua: z.number().optional(),
        floor_area_ratio: z.number().optional(),
    })
    .strict();
