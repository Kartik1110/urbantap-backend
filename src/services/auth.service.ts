import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import appleSignin from 'apple-signin-auth';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient, Role, User } from '@prisma/client';

import logger from '../utils/logger';
import emailService from '../common/services/email.service';
import { EmailRecipient, OtpSignupEmailData } from '../types/email.types';
import { EMAIL_CONFIG } from '../config/email.config';

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

    if (!user) {
        throw new Error('User not found');
    }

    if (!user.password) {
        throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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

/** This function is used to send an email to the user with an OTP and update the user */
const sendEmailOtpAndCreateUser = async (user: User) => {
    // Check if email is whitelisted
    const isWhitelisted = EMAIL_CONFIG.otp.whitelistedEmails.includes(
        user.email.toLowerCase()
    );

    let otp: number;
    if (isWhitelisted) {
        otp = parseInt(EMAIL_CONFIG.otp.whitelistOtpCode);
        logger.info(
            `Whitelisted email detected: ${user.email}, using OTP: ${otp}`
        );
    } else {
        otp = Math.floor(1000 + Math.random() * 9000);
        logger.info(`Generated OTP for ${user.email}: ${otp}`);
    }

    console.log('otp::::', otp);

    const emailSecret = await bcrypt.hash(otp.toString(), 10);

    const recipient: EmailRecipient = {
        email: user.email,
        name: user.name || 'User',
    };

    if (!recipient.name) {
        throw new Error('User name not found');
    }

    const data: OtpSignupEmailData = {
        recipientName: recipient.name,
        otpCode: String(otp),
        companyName: process.env.COMPANY_NAME || 'Ruba.ai',
        companyAddress: process.env.COMPANY_ADDRESS || 'Dubai, UAE',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@ruba.ai',
    };

    await prisma.user.update({
        where: { id: user.id },
        data: { email_secret: emailSecret },
    });

    // Send email to user
    await emailService.sendTemplateEmail(
        {
            name: 'otp-signup',
            description: 'OTP verification email for user signup',
        },
        recipient,
        data
    );
};

/** This function is used to verify the OTP */
const verifyOTP = async (userEnteredOTP: string, storedHash: string) => {
    try {
        const isValid = await bcrypt.compare(userEnteredOTP, storedHash);
        return isValid;
    } catch (error) {
        logger.error('Error verifying OTP:', error);
        return false;
    }
};

export const sendEmailOtpService = async (email: string) => {
    // Whitelisted emails check for testing purposes
    const isWhitelisted = EMAIL_CONFIG.otp.whitelistedEmails.includes(
        email.toLowerCase()
    );

    const userCompanyDomain = email.split('@')[1];

    // Skip company validation for whitelisted emails
    if (!isWhitelisted) {
        const companyDomainName = await prisma.company.findUnique({
            where: { domain_name: userCompanyDomain },
        });

        if (!companyDomainName) {
            throw new Error('Company is not registered with UrbanTap.');
        }

        if (userCompanyDomain !== companyDomainName.domain_name) {
            throw new Error(
                'You are not authorized to signup with this email.'
            );
        }
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
        await sendEmailOtpAndCreateUser(user);
        return;
    }

    const newUser = await prisma.user.create({
        data: {
            email,
            password: '',
        },
    });

    const company = await prisma.company.findUnique({
        where: { domain_name: userCompanyDomain },
        select: { id: true },
    });

    /* Create an empty broker for the user mapped to the company */
    await prisma.broker.create({
        data: {
            email,
            name: '',
            company: {
                connect: { id: company?.id },
            },
        },
    });

    await sendEmailOtpAndCreateUser(newUser);
    return;
};

export const verifyEmailOtpService = async (email: string, otp: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    const broker = await prisma.broker.findUnique({ where: { email } });

    if (!user || !user.email_secret) {
        throw new Error('User not found');
    }

    const isValid = await verifyOTP(otp, user.email_secret);
    if (!isValid) {
        throw new Error('Invalid OTP');
    }

    // Check if user is new based on creation time (within last 5 minutes)
    /* TODO: find some reliable logic to check if the user is new */
    const fiveMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const isNewUser = user.createdAt > fiveMinutesAgo;

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!
    );

    return {
        token,
        user,
        brokerId: broker?.id || null,
        is_new_user: isNewUser,
    };
};
