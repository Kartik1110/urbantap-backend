import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const error = err as AppError;
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    // Log the error
    logger.error('Error 💥', {
        message: error.message,
        stack: error.stack,
        statusCode: error.statusCode,
        path: req.originalUrl,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip
    });

    // Send response
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    });
}; 