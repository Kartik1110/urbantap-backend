import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import appleSignin from 'apple-signin-auth';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient, Role } from '@prisma/client';

import logger from '../utils/logger';

const prisma = new PrismaClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signupService = async (
    email: string,
    password: string,
    name: string,
    role: Role,
    w_number?: string,
    country_code?: string
) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userExists = await prisma.user.findUnique({
        where: { email },
    });

    if (userExists) {
        throw new Error('User with this email already exists');
    }

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role,
            w_number,
            country_code,
        },
    });

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!
    );

    return { user, token };
};

export const loginService = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    const broker = await prisma.broker.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!
    );

    return {
        token,
        user,
        brokerId: broker?.id || null,
    };
};

export const googleSignInService = async (idToken: string) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
        throw new Error('Invalid Google token payload');
    }

    let user = await prisma.user.findUnique({
        where: { email: payload.email },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: payload.email,
                googleId: payload.sub,
                password: '',
                name: payload.name || '',
                role: Role.BROKER,
            },
        });
    } else if (!user.googleId) {
        user = await prisma.user.update({
            where: { email: payload.email },
            data: { googleId: payload.sub },
        });
    }

    const broker = await prisma.broker.findUnique({
        where: { email: payload.email },
    });

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!
    );

    return {
        token,
        user_id: user.id,
        name: user.name,
        email: user.email,
        brokerId: broker?.id || null,
    };
};

export const appleSignInService = async (
    idToken: string,
    userIdentifier: string,
    email: string,
    name: string
) => {
    const appleUser = await appleSignin.verifyIdToken(idToken, {
        audience: process.env.APPLE_CLIENT_ID,
        ignoreExpiration: true,
    });

    if (!appleUser.email) {
        throw new Error('Invalid Apple token payload');
    }

    let user = await prisma.user.findFirst({
        where: {
            OR: [{ email: email }, { appleId: userIdentifier }],
        },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: email || appleUser.email,
                password: '',
                name: name || '',
                role: Role.BROKER,
                appleId: userIdentifier,
            },
        });
    } else if (!user.appleId) {
        try {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { appleId: userIdentifier },
            });
        } catch (error) {
            logger.warn(
                'Unable to update appleId - field may not exist in schema',
                error
            );
        }
    }

    const broker = await prisma.broker.findUnique({
        where: { email: email || appleUser.email },
    });

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!
    );

    return {
        token,
        user_id: user.id,
        name: user.name,
        email: user.email,
        brokerId: broker?.id || null,
    };
};

export const updateUserService = async (
    userId: string,
    data: {
        name?: string;
        role?: Role;
        w_number?: string;
        country_code?: string;
    }
) => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    const updateData: any = { name: data.name, role: data.role };
    if (data.w_number !== undefined) updateData.w_number = data.w_number;
    if (data.country_code !== undefined)
        updateData.country_code = data.country_code;

    const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
    });

    if (data.w_number !== undefined || data.country_code !== undefined) {
        await prisma.broker.updateMany({
            where: { user_id: userId },
            data: {
                ...(data.w_number !== undefined && { w_number: data.w_number }),
                ...(data.country_code !== undefined && {
                    country_code: data.country_code,
                }),
            },
        });
    }

    return user;
};

export const deleteUserService = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            brokers: {
                include: {
                    listings: true,
                    notifications: true,
                    sentByConnectionRequests: true,
                    sentToConnectionRequests: true,
                    sentByInquiries: true,
                    sentToInquiries: true,
                    broker1Connections: true,
                    broker2Connections: true,
                },
            },
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    await prisma.$transaction(async (prisma) => {
        for (const broker of user.brokers) {
            await prisma.inquiry.deleteMany({
                where: {
                    OR: [{ sent_by_id: broker.id }, { sent_to_id: broker.id }],
                },
            });

            await prisma.connectionRequest.deleteMany({
                where: {
                    OR: [{ sent_by_id: broker.id }, { sent_to_id: broker.id }],
                },
            });

            await prisma.connections.deleteMany({
                where: {
                    OR: [{ broker1_id: broker.id }, { broker2_id: broker.id }],
                },
            });

            await prisma.notification.deleteMany({
                where: { broker_id: broker.id },
            });

            await prisma.listing.deleteMany({
                where: { broker_id: broker.id },
            });

            await prisma.broker.delete({
                where: { id: broker.id },
            });
        }

        await prisma.user.delete({
            where: { id },
        });
    });
};

export const updateFcmTokenService = async (
    fcmToken: string,
    token: string
) => {
    const decoded = jwt.verify(
        token.replace('Bearer ', ''),
        process.env.JWT_SECRET!
    ) as {
        userId: string;
    };

    return prisma.user.update({
        where: { id: decoded.userId },
        data: { fcm_token: fcmToken },
    });
};
