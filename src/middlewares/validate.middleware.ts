import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

// Extend Request interface to include validatedData
declare global {
  namespace Express {
    interface Request {
      validatedData?: any;
    }
  }
}

// Enhanced validation middleware with better error handling
const validateSchema = (schema: ZodSchema, options?: { 
  parseBodyAsJson?: boolean, 
  jsonField?: string 
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let dataToValidate = req.body;

      // Handle cases where data is sent as JSON string (for multipart/form-data)
      if (options?.parseBodyAsJson && options?.jsonField) {
        try {
          dataToValidate = JSON.parse(req.body[options.jsonField]);
        } catch (parseError) {
          return res.status(400).json({
            status: "error",
            message: "Invalid JSON format",
            errors: [
              {
                field: options.jsonField,
                message: "Expected valid JSON string",
                received: req.body[options.jsonField]
              }
            ]
          });
        }
      }

      // Validate the data against the schema
      const validatedData = schema.parse(dataToValidate);
      
      // Attach validated data to request for use in controllers
      req.validatedData = validatedData;
      next();
      
    } catch (error) {
      if (error instanceof ZodError) {
        // Transform Zod errors into more meaningful error messages
        const formattedErrors = error.errors.map((err) => {
          const field = err.path.join('.');
          let message = err.message;
          
          // Customize error messages based on error types
          switch (err.code) {
            case 'invalid_type':
              message = `Expected ${err.expected} but received ${err.received}`;
              break;
            case 'too_small':
              message = `Value must be at least ${err.minimum}`;
              break;
            case 'too_big':
              message = `Value must be at most ${err.maximum}`;
              break;
            case 'invalid_string':
              if (err.validation === 'url') {
                message = 'Must be a valid URL';
              }
              break;
            case 'invalid_enum_value':
              message = `Must be one of: ${err.options?.join(', ')}`;
              break;
            default:
              message = err.message;
          }

          return {
            field: field || 'root',
            message,
            received: (err as any).received || 'unknown',
            ...(err.code === 'invalid_enum_value' && { validOptions: (err as any).options })
          };
        });

        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: formattedErrors,
          total_errors: formattedErrors.length
        });
      }
      
      // Handle other types of errors
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        status: "error",
        message: "Internal validation error"
      });
    }
  };
};

// Middleware specifically for validating JSON data within multipart forms
const validateJsonField = (schema: ZodSchema, fieldName: string = 'listing') => {
  return validateSchema(schema, { parseBodyAsJson: true, jsonField: fieldName });
};

// Export both middlewares
export default validateSchema;
export { validateJsonField };