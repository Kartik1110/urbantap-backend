import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorLoggingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    // Log error
    logger.error('ERROR', {
        method: req.method,
        url: req.url,
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });

    // Send error response
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        timestamp: new Date().toISOString()
    });
};

export default {
    errorLoggingMiddleware
}; 