import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";
import { Category, Prisma } from '@prisma/client';

export const signupAdmin = async (
    email: string,
    password: string,
    companyId: string
) => {
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { developerId: true, brokerageId: true },
    });

    if (!company) throw new Error('Company not found');

    const hashedPassword = await bcrypt.hash(password, 10);

    return await prisma.adminUser.create({
        data: {
            email,
            password: hashedPassword,
            companyId,
            developerId: company.developerId,
            brokerageId: company.brokerageId,
        },
    });
};

export const loginAdmin = async (email: string, password: string) => {
    const user = await prisma.adminUser.findUnique({ where: { email } });

    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            companyId: user.companyId,
            developerId: user.developerId,
            brokerageId: user.brokerageId,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );

    return token;
};

export const changeAdminPassword = async (
    adminUserId: string,
    oldPassword: string,
    newPassword: string
) => {
    const user = await prisma.adminUser.findUnique({
        where: { id: adminUserId },
    });

    if (!user) throw new Error('Admin user not found');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error('Old password is incorrect');

    const hashedNew = await bcrypt.hash(newPassword, 10);

    await prisma.adminUser.update({
        where: { id: adminUserId },
        data: { password: hashedNew },
    });
};

export const editLinkedDeveloper = async (
    adminUserId: string,
    updateData: any
) => {
    // Find the admin user
    const adminUser = await prisma.adminUser.findUnique({
        where: { id: adminUserId },
        select: { developerId: true },
    });

    if (!adminUser) {
        throw new Error('Admin user not found');
    }

    if (!adminUser.developerId) {
        throw new Error('This admin is not linked to any developer');
    }

    // Update developer
    const updatedDeveloper = await prisma.developer.update({
        where: { id: adminUser.developerId },
        data: {
            name: updateData.name,
            description: updateData.description,
            email: updateData.email,
            phone: updateData.phone,
            logo: updateData.logo,
            cover_image: updateData.cover_image,
        },
    });
    return updatedDeveloper;
};

export const getDevelopersService = async ({
    page,
    pageSize,
    search,
}: {
    page: number;
    pageSize: number;
    search?: string; // <- Add this line
}) => {
    const skip = (page - 1) * pageSize;

    const whereClause = search
        ? {
              name: {
                  contains: search,
                  mode: 'insensitive' as Prisma.QueryMode,
              },
          }
        : {};

    const [developers, totalCount] = await Promise.all([
        prisma.developer.findMany({
            where: whereClause,
            skip,
            take: pageSize,
            include: {
                projects: {
                    select: { id: true },
                },
            },
        }),
        prisma.developer.count({
            where: whereClause,
        }),
    ]);

    const pagination = {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
    };

    return { developers, pagination };
};

export const getDeveloperDetailsService = async (developerId: string) => {
    const developer = await prisma.developer.findUnique({
        where: { id: developerId },
        include: {
            projects: true,
            Broker: {
                include: {
                    company: true, // include company data for each broker
                },
            },
        },
    });

    if (!developer) throw new Error('Developer not found');

    const projectCount = developer.projects.length;

    const groupedProjects = {
        all: developer.projects,
        off_plan: developer.projects.filter(
            (p) => p.type === Category.Off_plan
        ),
        ready: developer.projects.filter(
            (p) => p.type === Category.Ready_to_move
        ),
    };

    const brokers = developer.Broker.map((broker) => ({
        id: broker.id,
        name: broker.name,
        profile_pic: broker.profile_pic,
        company: broker.company
            ? {
                  name: broker.company.name,
                  logo: broker.company.logo,
                  address: broker.company.address,
              }
            : null,
    }));

    return {
        id: developer.id,
        name: developer.name,
        logo: developer.logo,
        cover_image: developer.cover_image,
        description: developer.description,
        project_count: projectCount,
        contact: {
            email: developer.email,
            phone: developer.phone,
        },
        projects: groupedProjects,
        brokers,
    };
};

export const createProjectService = async (data: any) => {
    return await prisma.project.create({
        data,
    });
};

export const getCompanyByIdService = async (companyId: string) => {
    return await prisma.company.findUnique({
        where: { id: companyId },
        include: {
            brokers: {
                include: {
                    listings: true,
                },
            },
            developer: true,
            brokerage: true,
        },
    });
};

export const createCompanyPostService = async (data: {
    title: string;
    caption: string;
    image: string;
    company_id: string;
}) => {
    return await prisma.companyPost.create({ data });
};

export const editCompanyPostService = async (
    id: string,
    updateData: { title?: string; caption?: string; image?: string }
) => {
    return await prisma.companyPost.update({
        where: { id },
        data: updateData,
    });
};