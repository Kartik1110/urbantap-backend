import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserAuthTokenPayload {
    userId: string;
    role: string;
}

export const authMiddleware = async (
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
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as UserAuthTokenPayload;

        if (!decoded.userId) {
            return res.status(401).json({ error: 'Invalid token payload' });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true, email: true },
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        /* Removing this check since we are generating token after verify otp and we don't have role selection there */
        /* TODO: figure out a better way to generate token */
        // if (user.role !== decoded.role) {
        //     return res.status(401).json({ error: 'Token role mismatch' });
        // }

        (req as Request & { user: UserAuthTokenPayload }).user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
