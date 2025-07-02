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
  Admin_Status,
  Quarter,
  Type_of_use,
  DealType,
  CurrentStatus,
  Views,
  Market,
} from "@prisma/client";

export const editListingSchema = z
  .object({
    title: z.string()
      .min(1, "Title cannot be empty")
      .max(255, "Title must be less than 255 characters")
      .optional(),
    
    description: z.string()
      .min(1, "Description cannot be empty")
      .max(2000, "Description must be less than 2000 characters")
      .optional(),
    
    image: z.string()
      .url("Must be a valid URL")
      .optional(),
    
    min_price: z.number()
      .positive("Price must be positive")
      .max(1000000000, "Price seems unreasonably high")
      .optional(),
    
    max_price: z.number()
      .positive("Price must be positive")
      .max(1000000000, "Price seems unreasonably high")
      .optional(),
    
    sq_ft: z.number()
      .positive("Square footage must be positive")
      .max(100000, "Square footage seems unreasonably high")
      .optional(),
    
    type: z.nativeEnum(Type, {
      errorMap: () => ({ message: `Type must be one of: ${Object.values(Type).join(', ')}` })
    }).optional(),
    
    category: z.nativeEnum(Category, {
      errorMap: () => ({ message: `Category must be one of: ${Object.values(Category).join(', ')}` })
    }).optional(),
    
    looking_for: z.boolean().optional(),
    
    rental_frequency: z.nativeEnum(Rental_frequency, {
      errorMap: () => ({ message: `Rental frequency must be one of: ${Object.values(Rental_frequency).join(', ')}` })
    }).optional(),
    
    no_of_bedrooms: z.nativeEnum(Bedrooms, {
      errorMap: () => ({ message: `Bedrooms must be one of: ${Object.values(Bedrooms).join(', ')}` })
    }).optional(),
    
    no_of_bathrooms: z.nativeEnum(Bathrooms, {
      errorMap: () => ({ message: `Bathrooms must be one of: ${Object.values(Bathrooms).join(', ')}` })
    }).optional(),
    
    furnished: z.nativeEnum(Furnished, {
      errorMap: () => ({ message: `Furnished status must be one of: ${Object.values(Furnished).join(', ')}` })
    }).optional(),
    
    cheques: z.number()
      .int("Number of cheques must be a whole number")
      .min(1, "Number of cheques must be at least 1")
      .max(12, "Number of cheques cannot exceed 12")
      .optional(),
    
    city: z.nativeEnum(City, {
      errorMap: () => ({ message: `City must be one of: ${Object.values(City).join(', ')}` })
    }).optional(),
    
    address: z.string()
      .min(1, "Address cannot be empty")
      .max(500, "Address must be less than 500 characters")
      .optional(),
    
    handover_year: z.number()
      .int("Handover year must be a whole number")
      .min(1900, "Handover year seems too old")
      .max(2050, "Handover year seems too far in the future")
      .optional(),
    
    handover_quarter: z.nativeEnum(Quarter, {
      errorMap: () => ({ message: `Quarter must be one of: ${Object.values(Quarter).join(', ')}` })
    }).optional(),
    
    type_of_use: z.nativeEnum(Type_of_use, {
      errorMap: () => ({ message: `Type of use must be one of: ${Object.values(Type_of_use).join(', ')}` })
    }).optional(),
    
    deal_type: z.nativeEnum(DealType, {
      errorMap: () => ({ message: `Deal type must be one of: ${Object.values(DealType).join(', ')}` })
    }).optional(),
    
    current_status: z.nativeEnum(CurrentStatus, {
      errorMap: () => ({ message: `Current status must be one of: ${Object.values(CurrentStatus).join(', ')}` })
    }).optional(),
    
    views: z.nativeEnum(Views, {
      errorMap: () => ({ message: `Views must be one of: ${Object.values(Views).join(', ')}` })
    }).optional(),
    
    market: z.nativeEnum(Market, {
      errorMap: () => ({ message: `Market must be one of: ${Object.values(Market).join(', ')}` })
    }).optional(),
    
    latitude: z.number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .optional(),
    
    longitude: z.number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .optional(),
    
    amenities: z.array(z.string().min(1, "Amenity name cannot be empty"))
      .max(50, "Too many amenities (maximum 50)")
      .optional(),
    
    image_urls: z.array(z.string().url("Each image URL must be valid"))
      .max(20, "Too many images (maximum 20)")
      .optional(),
    
    project_age: z.number()
      .int("Project age must be a whole number")
      .min(0, "Project age cannot be negative")
      .max(100, "Project age seems unreasonably high")
      .optional(),
    
    payment_plan: z.nativeEnum(Payment_Plan, {
      errorMap: () => ({ message: `Payment plan must be one of: ${Object.values(Payment_Plan).join(', ')}` })
    }).optional(),
    
    sale_type: z.nativeEnum(Sale_Type, {
      errorMap: () => ({ message: `Sale type must be one of: ${Object.values(Sale_Type).join(', ')}` })
    }).optional(),
    
    admin_status: z.nativeEnum(Admin_Status, {
      errorMap: () => ({ message: `Admin status must be one of: ${Object.values(Admin_Status).join(', ')}` })
    }).optional(),
    
    parking_space: z.boolean().optional(),
    
    service_charge: z.number()
      .min(0, "Service charge cannot be negative")
      .max(100000, "Service charge seems unreasonably high")
      .optional(),
    
    construction_progress: z.number()
      .min(0, "Construction progress cannot be negative")
      .max(100, "Construction progress cannot exceed 100%")
      .optional(),
    
    gfa_bua: z.number()
      .positive("GFA/BUA must be positive")
      .max(100000, "GFA/BUA seems unreasonably high")
      .optional(),
    
    floor_area_ratio: z.number()
      .positive("Floor area ratio must be positive")
      .max(20, "Floor area ratio seems unreasonably high")
      .optional(),
  })
  .strict()
  .refine((data) => {
    // Custom validation: max_price should be >= min_price if both are provided
    if (data.min_price && data.max_price && data.max_price < data.min_price) {
      return false;
    }
    return true;
  }, {
    message: "Maximum price must be greater than or equal to minimum price",
    path: ["max_price"]
  })
  .refine((data) => {
    // Custom validation: if handover_quarter is provided, handover_year should also be provided
    if (data.handover_quarter && !data.handover_year) {
      return false;
    }
    return true;
  }, {
    message: "Handover year is required when handover quarter is specified",
    path: ["handover_year"]
  });
