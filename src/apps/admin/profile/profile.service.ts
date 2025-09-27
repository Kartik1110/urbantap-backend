import prisma from '@/utils/prisma';
import { DecodedAdminUser } from '@/utils/verifyToken';
import { CompanyType, Prisma, Category } from '@prisma/client';

export const getProfileService = async (user: DecodedAdminUser) => {
    const data = await prisma.company.findUnique({
        where: { id: user.companyId },
        include: {
            developer: {
                select: {
                    cover_image: true,
                },
            },
            brokerage: {
                select: {
                    about: true,
                    ded: true,
                    rera: true,
                    service_areas: true,
                },
            },
        },
    });

    if (!data) {
        throw new Error('Company not found');
    }

    let entityData = null;
    if (user.type === CompanyType.Developer && data.developer) {
        entityData = data.developer;
    } else if (user.type === CompanyType.Brokerage && data.brokerage) {
        entityData = data.brokerage;
    }

    return {
        companyId: data.id,
        name: data.name,
        logo: data.logo,
        description: data.description,
        email: data.email,
        phone: data.phone,
        type: data.type,
        website: data.website,
        address: data.address,
        entityData,
    };
};

export const getDevelopersService = async ({
    page,
    pageSize,
    search,
}: {
    page: number;
    pageSize: number;
    search?: string;
}) => {
    const skip = (page - 1) * pageSize;

    const whereClause = search
        ? {
              company: {
                  name: {
                      contains: search,
                      mode: 'insensitive' as Prisma.QueryMode,
                  },
              },
          }
        : {};

    const [developers, totalCount] = await Promise.all([
        prisma.developer.findMany({
            where: whereClause,
            skip,
            take: pageSize,
            include: {
                company: {
                    select: {
                        name: true,
                        logo: true,
                        description: true,
                        email: true,
                        phone: true,
                    },
                },
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
            company: {
                select: {
                    name: true,
                    logo: true,
                    description: true,
                    email: true,
                    phone: true,
                },
            },
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
            (p) => p.category === Category.Off_plan
        ),
        ready: developer.projects.filter(
            (p) => p.category === Category.Ready_to_move
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

export const editLinkedCompany = async (
    user: DecodedAdminUser,
    updateData: {
        name?: string;
        description?: string;
        email?: string;
        phone?: string;
        logo?: string;
        cover_image?: string;
        website?: string;
        address?: string;
        about?: string;
        ded?: string;
        rera?: string;
        service_areas?: string[];
    }
) => {
    // Find the admin user
    const adminUser = await prisma.adminUser.findUnique({
        where: { id: user.id },
        select: {
            company_id: true,
            company: {
                select: {
                    type: true,
                    id: true,
                    brokerageId: true,
                    developerId: true,
                },
            },
        },
    });

    if (!adminUser) {
        throw new Error('Admin user not found');
    }

    if (!adminUser.company_id) {
        throw new Error('This admin is not linked to any company');
    }

    await prisma.company.update({
        where: { id: adminUser.company_id },
        data: {
            name: updateData.name,
            description: updateData.description,
            email: updateData.email,
            phone: updateData.phone,
            logo: updateData.logo,
            website: updateData.website,
            address: updateData.address,
        },
    });

    if (adminUser.company.type === CompanyType.Developer) {
        const updatedDeveloper = await prisma.developer.update({
            where: { id: user.entityId },
            data: {
                cover_image: updateData.cover_image,
            },
        });
        return updatedDeveloper;
    } else if (adminUser.company.type === CompanyType.Brokerage) {
        const updatedBrokerage = await prisma.brokerage.update({
            where: { id: user.entityId },
            data: {
                about: updateData.about,
                ded: updateData.ded,
                rera: updateData.rera,
                service_areas: updateData.service_areas,
            },
        });
        return updatedBrokerage;
    }
};
