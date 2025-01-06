import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, originalUrl, ip, body } = req;

    // Log the incoming request
    logger.info(`Incoming ${method} ${originalUrl} from ${ip}`);
    
    // Log request body if present (excluding sensitive data)
    if (Object.keys(body).length > 0) {
        const sanitizedBody = { ...body };
        // Remove sensitive information
        delete sanitizedBody.password;
        delete sanitizedBody.token;
        delete sanitizedBody.idToken;
        logger.info(`Request body: ${JSON.stringify(sanitizedBody)}`);
    }

    // Capture the response
    const originalSend = res.send;
    res.send = function (body) {
        const responseTime = Date.now() - start;
        
        // Log the response
        logger.info(`Response ${method} ${originalUrl} - Status: ${res.statusCode} - ${responseTime}ms`);
        
        return originalSend.call(this, body);
    };

    next();
}; 