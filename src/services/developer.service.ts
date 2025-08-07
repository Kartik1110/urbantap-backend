import prisma from '../utils/prisma';
import { Category, CompanyType, Prisma } from '@prisma/client';

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
            type: CompanyType.Developer,
        }
        : {
            type: CompanyType.Developer,
        };

    const [developers, totalCount] = await Promise.all([
        prisma.company.findMany({
            where: whereClause,
            skip,
            take: pageSize,
            include: {
                developer: {
                    include: {
                        _count: {
                            select: {
                                projects: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.company.count({
            where: whereClause,
        }),
    ]);
    const developersWithProjectCount = developers.map(company => ({
        id: company.developer?.id,
        name: company.name,
        logo: company.logo,
        description: company.description,
        email: company.email,
        phone: company.phone,
        address: company.address,
        projects_count: company.developer?._count?.projects || 0,
    }));

    const pagination = {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
    };

    return { developers, pagination, Project_count: developersWithProjectCount };
};

export const createDeveloperService = async (data: {
    name: string;
    logo: string;
    cover_image?: string;
    description: string;
    email?: string;
    phone?: string;
    company_id: string;
}) => {
    return await prisma.developer.create({
        data,
    });
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
            company: {
                select: {
                    name: true,
                    logo: true,
                    description: true,
                    email: true,
                    phone: true,
                    address: true,
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
        name: developer.company?.name,
        logo: developer.company?.logo,
        cover_image: developer.cover_image,
        description: developer.company?.description,
        project_count: projectCount,
        contact: {
            email: developer.company?.email,
            phone: developer.company?.phone,
        },
        projects: groupedProjects,
        brokers,
    };
};
