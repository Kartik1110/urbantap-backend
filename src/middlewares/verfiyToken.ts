import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request locally
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        userId: string; // Add this for compatibility with logging middleware
        email: string;
        companyId?: string;
        developerId?: string;
        brokerageId?: string;
    };
}

export const verifyToken = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const token =
        req.cookies?.token ||
        (req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : null);

    if (!token) {
        return res
            .status(401)
            .json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as any;

        // Set both id and userId for compatibility
        req.user = {
            id: decoded?.id || '',
            userId: decoded?.id || '',
            email: decoded?.email || '',
            companyId: decoded?.companyId,
            developerId: decoded?.developerId,
            brokerageId: decoded?.brokerageId
        };
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};
