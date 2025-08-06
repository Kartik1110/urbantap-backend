import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestResponseLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Log incoming request
    logger.info('REQUEST', {
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });

    // Override res.end to capture response
    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any, cb?: any) {
        const duration = Date.now() - startTime;

        // Log response
        logger.info('RESPONSE', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${duration}ms`,
            timestamp: new Date().toISOString()
        });

        return originalEnd.call(this, chunk, encoding, cb);
    };

    next();
};

export default {
    requestResponseLoggingMiddleware
}; 