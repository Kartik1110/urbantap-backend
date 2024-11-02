import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

const validateSchema = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Validation error",
          errors: error.errors,
        });
      }
      next(error);
    }
  };
};

export default validateSchema;