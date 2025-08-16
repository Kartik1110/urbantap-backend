import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res
            .status(401)
            .json({ error: 'Access denied, no token provided' });
    }
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        (req as any).user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ error: 'Invalid token' });
    }
};
