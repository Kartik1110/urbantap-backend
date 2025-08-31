import { Request, Response, NextFunction } from 'express';

/* This middleware is for Ruba ADMINs only */
export const adminMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if ((req as any).user?.role === 'ADMIN') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied. Admins only.' });
};
