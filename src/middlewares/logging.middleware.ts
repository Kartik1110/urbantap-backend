import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Generate unique request ID
    const requestId = uuidv4();
    (req as any).requestId = requestId;
    (req as any).startTime = Date.now();

    // Extract user ID from JWT token if available
    let userId = 'anonymous';
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.replace('Bearer ', '');
            // You can decode the JWT here to get userId if needed
            // For now, we'll use a placeholder
            userId = 'authenticated-user';
        }
    } catch (error) {
        // If token decoding fails, keep as anonymous
    }

    // Log incoming request details
    logger.info('Incoming request', {
        timestamp: new Date().toISOString(),
        level: 'info',
        type: 'request',
        requestId,
        method: req.method,
        url: req.url,
        path: req.path,
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        headers: {
            'user-agent': req.get('User-Agent'),
            'content-type': req.get('Content-Type'),
            'accept': req.get('Accept'),
            'authorization': req.headers.authorization ? '[REDACTED]' : undefined,
            'content-length': req.get('Content-Length'),
            'host': req.get('Host'),
            'referer': req.get('Referer')
        },
        body: req.method !== 'GET' && req.body ? '[REDACTED]' : undefined,
        ip: req.ip || req.connection.remoteAddress,
        userId,
        userAgent: req.get('User-Agent'),
        correlationId: req.headers['x-correlation-id'] as string || requestId
    });

    // Override res.end to capture response details
    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any, cb?: any) {
        const duration = Date.now() - ((req as any).startTime || Date.now());

        // Log response details
        logger.info('Request completed', {
            timestamp: new Date().toISOString(),
            level: 'info',
            type: 'response',
            requestId,
            method: req.method,
            url: req.url,
            path: req.path,
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            responseTime: duration,
            responseSize: chunk ? chunk.length : 0,
            userId,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            correlationId: req.headers['x-correlation-id'] as string || requestId
        });

        // Log errors specifically
        if (res.statusCode >= 400) {
            logger.warn('Request failed', {
                timestamp: new Date().toISOString(),
                level: 'warn',
                type: 'error',
                requestId,
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                responseTime: duration,
                userId,
                userAgent: req.get('User-Agent'),
                ip: req.ip || req.connection.remoteAddress,
                correlationId: req.headers['x-correlation-id'] as string || requestId
            });
        }

        // Log slow requests
        if (duration > 1000) {
            logger.warn('Slow request detected', {
                timestamp: new Date().toISOString(),
                level: 'warn',
                type: 'performance',
                requestId,
                method: req.method,
                url: req.url,
                responseTime: duration,
                threshold: 1000,
                statusCode: res.statusCode,
                userId,
                correlationId: req.headers['x-correlation-id'] as string || requestId
            });
        }

        // Call the original end method with proper return type
        return originalEnd.call(this, chunk, encoding, cb);
    };

    next();
};

// Additional middleware for specific route logging
export const routeSpecificLoggingMiddleware = (routeName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        logger.info(`Route accessed: ${routeName}`, {
            timestamp: new Date().toISOString(),
            level: 'info',
            type: 'request',
            requestId: (req as any).requestId,
            route: routeName,
            method: req.method,
            url: req.url,
            userId: (req as any).user?.userId || (req as any).user?.id || 'anonymous',
            correlationId: req.headers['x-correlation-id'] as string || (req as any).requestId
        });
        next();
    };
};

// Middleware for API performance monitoring
export const performanceLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime();

    res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

        // Log performance metrics
        logger.info('Performance metrics', {
            timestamp: new Date().toISOString(),
            level: 'info',
            type: 'performance',
            requestId: (req as any).requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: duration,
            userId: (req as any).user?.userId || (req as any).user?.id || 'anonymous',
            correlationId: req.headers['x-correlation-id'] as string || (req as any).requestId
        });

        // Alert for slow requests (over 1 second)
        if (duration > 1000) {
            logger.warn('Slow request detected', {
                timestamp: new Date().toISOString(),
                level: 'warn',
                type: 'performance',
                requestId: (req as any).requestId,
                method: req.method,
                url: req.url,
                responseTime: duration,
                threshold: 1000,
                statusCode: res.statusCode,
                userId: (req as any).user?.userId || (req as any).user?.id || 'anonymous',
                correlationId: req.headers['x-correlation-id'] as string || (req as any).requestId
            });
        }
    });

    next();
};

// Middleware for database operation logging
export const databaseLoggingMiddleware = (operation: string, table?: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();

        logger.info('Database operation started', {
            timestamp: new Date().toISOString(),
            level: 'info',
            type: 'database',
            requestId: (req as any).requestId,
            operation,
            table,
            method: req.method,
            url: req.url,
            userId: (req as any).user?.userId || (req as any).user?.id || 'anonymous',
            correlationId: req.headers['x-correlation-id'] as string || (req as any).requestId
        });

        // Override res.end to log database operation completion
        const originalEnd = res.end;
        res.end = function (chunk?: any, encoding?: any, cb?: any) {
            const duration = Date.now() - startTime;

            logger.info('Database operation completed', {
                timestamp: new Date().toISOString(),
                level: 'info',
                type: 'database',
                requestId: (req as any).requestId,
                operation,
                table,
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                duration,
                userId: (req as any).user?.userId || (req as any).user?.id || 'anonymous',
                correlationId: req.headers['x-correlation-id'] as string || (req as any).requestId
            });

            return originalEnd.call(this, chunk, encoding, cb);
        };

        next();
    };
};

// Middleware for authentication logging
export const authLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const hasAuthHeader = !!req.headers.authorization;
    const authMethod = req.headers.authorization?.startsWith('Bearer ') ? 'JWT' : 'None';

    logger.info('Authentication check', {
        timestamp: new Date().toISOString(),
        level: 'info',
        type: 'security',
        requestId: (req as any).requestId,
        hasAuth: hasAuthHeader,
        authMethod,
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        correlationId: req.headers['x-correlation-id'] as string || (req as any).requestId
    });

    next();
};

// Export all middleware functions
export default {
    requestLoggingMiddleware,
    routeSpecificLoggingMiddleware,
    performanceLoggingMiddleware,
    databaseLoggingMiddleware,
    authLoggingMiddleware
}; 