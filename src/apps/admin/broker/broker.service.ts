import { Express } from 'express';
import prisma from '@/utils/prisma';
import { AdminUserType, Role } from '@prisma/client';
import { uploadToS3 } from '@/utils/s3Upload';
import bcrypt from 'bcryptjs';

/**
 * Get brokers for a company (excluding those already assigned as team members)
 */
export const getBrokersService = async (
    companyId: string,
    independent: Boolean = false
) => {
    // Get all broker IDs that are already admin users (team members) for this company
    const adminUserBrokers = await prisma.adminUser.findMany({
        where: {
            company_id: companyId,
            broker_id: { not: null },
        },
        select: { broker_id: true },
    });

    if (independent) {
        return await prisma.broker.findMany({
            where: {
                company_id: companyId,
            },
        });
    }
    const brokerIdsInAdminUser = adminUserBrokers
        .map((au) => au.broker_id)
        .filter((id): id is string => !!id);

    // Return brokers who are NOT in adminUser as a member
    return await prisma.broker.findMany({
        where: {
            company_id: companyId,
            id: { notIn: brokerIdsInAdminUser },
        },
    });
};

export const createBrokerService = async (
    companyId: string,
    brokerData: {
        name: string;
        email: string;
        w_number?: string;
        country_code?: string;
        profile_pic: Express.Multer.File | null;
    }
) => {
    const { name, email, w_number, country_code, profile_pic } = brokerData;

    // Get company to verify domain
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { domain_name: true },
    });

    if (!company) {
        throw new Error('Company not found');
    }

    // Check if email domain matches company domain
    const emailDomain = email.split('@')[1];
    if (company.domain_name && emailDomain !== company.domain_name) {
        throw new Error(
            `Email domain must match company domain: ${company.domain_name}`
        );
    }

    // Check if user or broker already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    const existingBroker = await prisma.broker.findUnique({
        where: { email },
    });

    if (existingUser || existingBroker) {
        throw new Error('User with this email already exists');
    }

    // Upload profile picture if provided
    let profilePicUrl = '';
    if (profile_pic) {
        const ext = profile_pic.originalname.split('.').pop();
        profilePicUrl = await uploadToS3(
            profile_pic.path,
            `brokers/profile_${Date.now()}.${ext}`
        );
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Create user and broker in a transaction
    await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
            data: {
                email,
                password: '',
                name,
                role: Role.SM,
                w_number,
                country_code,
            },
        });

        // Create broker mapped to the company and user
        const broker = await tx.broker.create({
            data: {
                name,
                email,
                w_number,
                country_code,
                profile_pic: profilePicUrl || undefined,
                company: {
                    connect: { id: companyId },
                },
                user: {
                    connect: { id: user.id },
                },
            },
        });

        // Create admin user linked to this broker
        await tx.adminUser.create({
            data: {
                email,
                password: hashedPassword,
                type: AdminUserType.MEMBER,
                company: {
                    connect: { id: companyId },
                },
                broker: {
                    connect: { id: broker.id },
                },
            },
        });
    });
};
