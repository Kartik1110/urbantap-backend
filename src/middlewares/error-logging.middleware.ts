import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorLoggingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const requestId = (req as any).requestId || 'unknown';
    const userId = (req as any).user?.userId || (req as any).user?.id || 'anonymous';
    const correlationId = req.headers['x-correlation-id'] as string || requestId;

    // Log detailed error information
    logger.error('Unhandled error', {
        timestamp: new Date().toISOString(),
        level: 'error',
        type: 'error',
        requestId,
        method: req.method,
        url: req.url,
        path: req.path,
        error: {
            message: err.message,
            name: err.name,
            stack: err.stack,
            code: (err as any).code || 'UNKNOWN_ERROR'
        },
        request: {
            headers: {
                'user-agent': req.get('User-Agent'),
                'content-type': req.get('Content-Type'),
                'authorization': req.headers.authorization ? '[REDACTED]' : undefined,
                'content-length': req.get('Content-Length'),
                'host': req.get('Host')
            },
            body: req.method !== 'GET' && req.body ? '[REDACTED]' : undefined,
            query: Object.keys(req.query).length > 0 ? req.query : undefined,
            params: Object.keys(req.params).length > 0 ? req.params : undefined,
            ip: req.ip || req.connection.remoteAddress
        },
        userId,
        userAgent: req.get('User-Agent'),
        correlationId,
        context: {
            service: 'api',
            function: 'error-handler',
            environment: process.env.NODE_ENV || 'development'
        }
    });

    // Send error response
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        requestId,
        timestamp: new Date().toISOString()
    });
};

// Middleware for catching specific types of errors
export const validationErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'ValidationError' || err.name === 'ZodError') {
        const requestId = (req as any).requestId || 'unknown';
        const userId = (req as any).user?.userId || (req as any).user?.id || 'anonymous';
        const correlationId = req.headers['x-correlation-id'] as string || requestId;

        logger.warn('Validation error', {
            timestamp: new Date().toISOString(),
            level: 'warn',
            type: 'error',
            requestId,
            method: req.method,
            url: req.url,
            error: {
                message: err.message,
                name: err.name,
                details: err.details || err.errors || err.message,
                code: 'VALIDATION_ERROR'
            },
            request: {
                body: req.body,
                query: req.query,
                params: req.params
            },
            userId,
            correlationId,
            context: {
                service: 'api',
                function: 'validation',
                environment: process.env.NODE_ENV || 'development'
            }
        });

        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            details: err.details || err.errors || err.message,
            requestId,
            timestamp: new Date().toISOString()
        });
    }

    next(err);
};

// Middleware for authentication errors
export const authErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.message === 'Unauthorized') {
        const requestId = (req as any).requestId || 'unknown';
        const userId = (req as any).user?.userId || (req as any).user?.id || 'anonymous';
        const correlationId = req.headers['x-correlation-id'] as string || requestId;

        logger.warn('Authentication error', {
            timestamp: new Date().toISOString(),
            level: 'warn',
            type: 'security',
            requestId,
            method: req.method,
            url: req.url,
            error: {
                message: err.message,
                name: err.name,
                code: 'AUTH_ERROR'
            },
            request: {
                headers: {
                    'user-agent': req.get('User-Agent'),
                    'authorization': req.headers.authorization ? '[REDACTED]' : undefined
                },
                ip: req.ip || req.connection.remoteAddress
            },
            userId,
            userAgent: req.get('User-Agent'),
            correlationId,
            context: {
                service: 'api',
                function: 'authentication',
                environment: process.env.NODE_ENV || 'development'
            }
        });

        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized',
            requestId,
            timestamp: new Date().toISOString()
        });
    }

    next(err);
};

// Middleware for database errors
export const databaseErrorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.code && (err.code.startsWith('P') || err.code === '23505' || err.code === '23503')) {
        const requestId = (req as any).requestId || 'unknown';
        const userId = (req as any).user?.userId || (req as any).user?.id || 'anonymous';
        const correlationId = req.headers['x-correlation-id'] as string || requestId;

        logger.error('Database error', {
            timestamp: new Date().toISOString(),
            level: 'error',
            type: 'database',
            requestId,
            method: req.method,
            url: req.url,
            error: {
                message: err.message,
                name: err.name,
                code: err.code,
                meta: err.meta,
                stack: err.stack
            },
            request: {
                body: req.body,
                query: req.query,
                params: req.params
            },
            userId,
            correlationId,
            context: {
                service: 'database',
                function: 'query',
                environment: process.env.NODE_ENV || 'development'
            }
        });

        return res.status(500).json({
            status: 'error',
            message: 'Database operation failed',
            requestId,
            timestamp: new Date().toISOString()
        });
    }

    next(err);
};

export default {
    errorLoggingMiddleware,
    validationErrorMiddleware,
    authErrorMiddleware,
    databaseErrorMiddleware
}; 