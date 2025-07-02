# Robust Input Validation System

This document explains how to implement and use the enhanced validation middleware system with Zod schemas for robust input validation.

## Overview

The validation system consists of:
1. **Enhanced validation middleware** (`src/middlewares/validate.middleware.ts`)
2. **Zod schemas** for input validation (e.g., `src/schema/editListings.schema.ts`)
3. **Route-level validation** integration
4. **Meaningful error responses**

## Key Features

### 1. Enhanced Error Messages
- Custom error messages for each validation rule
- Field-specific error information
- Enum validation with available options
- Cross-field validation (e.g., max_price >= min_price)

### 2. Multiple Validation Modes
- **Standard JSON validation**: `validateSchema(schema)`
- **Multipart form validation**: `validateJsonField(schema, fieldName)`

### 3. Type Safety
- Validated data is attached to `req.validatedData`
- Full TypeScript support

## Usage Examples

### 1. Standard JSON Body Validation

```typescript
// Route definition
router.post(
  "/listings/report/:id", 
  validateSchema(reportListingSchema),
  reportListingController
);

// Controller usage
export const reportListingController = async (req: Request, res: Response) => {
  const validatedData = req.validatedData; // Type-safe validated data
  // ... rest of controller logic
};
```

### 2. Multipart Form Data with JSON Field

```typescript
// Route definition - validates 'listing' field as JSON
router.put(
  "/listings/:id",
  upload.array("images"),
  validateJsonField(editListingSchema, "listing"),
  editListingController
);

// Controller usage
export const editListingController = async (req: Request, res: Response) => {
  const updates = req.validatedData; // Validated listing data
  const images = req.files; // File uploads handled separately
  // ... rest of controller logic
};
```

### 3. Creating Robust Schemas

```typescript
import { z } from "zod";

export const editListingSchema = z
  .object({
    title: z.string()
      .min(1, "Title cannot be empty")
      .max(255, "Title must be less than 255 characters")
      .optional(),
    
    min_price: z.number()
      .positive("Price must be positive")
      .max(1000000000, "Price seems unreasonably high")
      .optional(),
    
    // Enum with custom error message
    type: z.nativeEnum(Type, {
      errorMap: () => ({ message: `Type must be one of: ${Object.values(Type).join(', ')}` })
    }).optional(),
    
    // Array validation
    amenities: z.array(z.string().min(1, "Amenity name cannot be empty"))
      .max(50, "Too many amenities (maximum 50)")
      .optional(),
  })
  .strict() // Reject unknown fields
  .refine((data) => {
    // Cross-field validation
    if (data.min_price && data.max_price && data.max_price < data.min_price) {
      return false;
    }
    return true;
  }, {
    message: "Maximum price must be greater than or equal to minimum price",
    path: ["max_price"]
  });
```

## Error Response Format

### Validation Errors
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "min_price",
      "message": "Price must be positive",
      "received": -100
    },
    {
      "field": "type",
      "message": "Type must be one of: SALE, RENT",
      "received": "INVALID_TYPE",
      "validOptions": ["SALE", "RENT"]
    }
  ],
  "total_errors": 2
}
```

### JSON Parse Errors (for multipart forms)
```json
{
  "status": "error",
  "message": "Invalid JSON format",
  "errors": [
    {
      "field": "listing",
      "message": "Expected valid JSON string",
      "received": "invalid json string"
    }
  ]
}
```

## Best Practices

### 1. Schema Design
- Always include meaningful error messages
- Set reasonable min/max limits
- Use custom validation for business logic
- Group related validations

### 2. Controller Implementation
```typescript
export const editListingController = async (req: Request, res: Response) => {
  // ✅ Use validated data
  const updates = req.validatedData;
  
  // ✅ Handle other request parts separately
  const images = req.files as Express.Multer.File[];
  const listingId = req.params.id;
  
  try {
    // Your business logic here
    const result = await editListingService(listingId, updates);
    
    return res.json({
      status: "success",
      message: "Listing updated successfully",
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      status: "error", 
      message: "Failed to update listing",
      error: error.message
    });
  }
};
```

### 3. Route Organization
```typescript
// ✅ Apply validation before controller
router.put(
  "/listings/:id",
  upload.array("images"),           // File upload middleware
  validateJsonField(editListingSchema, "listing"), // Validation
  editListingController             // Controller
);
```

## Advanced Validation Patterns

### 1. Conditional Validation
```typescript
.refine((data) => {
  // Only validate handover_year if handover_quarter is provided
  if (data.handover_quarter && !data.handover_year) {
    return false;
  }
  return true;
}, {
  message: "Handover year is required when handover quarter is specified",
  path: ["handover_year"]
})
```

### 2. Transform and Validate
```typescript
const schema = z.object({
  price: z.string().transform((val) => parseFloat(val)).pipe(
    z.number().positive("Price must be positive")
  )
});
```

### 3. Custom Validators
```typescript
const emailSchema = z.string().refine((email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}, {
  message: "Invalid email format"
});
```

## Migration Guide

### Before (Unsafe)
```typescript
export const editListingController = async (req: Request, res: Response) => {
  const listingString = req.body.listing;
  let updates;
  
  try {
    updates = JSON.parse(listingString); // ❌ No validation
  } catch (error) {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  
  // ❌ No input validation - vulnerable to invalid data
};
```

### After (Robust)
```typescript
// ✅ Validation in route
router.put(
  "/listings/:id",
  upload.array("images"),
  validateJsonField(editListingSchema, "listing"),
  editListingController
);

// ✅ Controller uses validated data
export const editListingController = async (req: Request, res: Response) => {
  const updates = req.validatedData; // ✅ Already validated and type-safe
};
```

## Testing Validation

```typescript
// Test invalid input
const response = await request(app)
  .put('/listings/123')
  .send({ listing: JSON.stringify({ min_price: -100 }) })
  .expect(400);

expect(response.body).toEqual({
  status: "error",
  message: "Validation failed", 
  errors: expect.arrayContaining([
    expect.objectContaining({
      field: "min_price",
      message: "Price must be positive"
    })
  ])
});
```

This validation system ensures your API is robust, provides meaningful feedback to clients, and maintains data integrity throughout your application. 