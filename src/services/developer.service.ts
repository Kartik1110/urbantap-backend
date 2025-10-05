import prisma from '../utils/prisma';
import { AdminUserType, Category, CompanyType, Prisma } from '@prisma/client';

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

    const [developersRaw, totalCount] = await Promise.all([
        prisma.company.findMany({
            where: whereClause,
            skip,
            take: pageSize,
            orderBy: {
                developer: {
                    projects: {
                        _count: 'desc',
                    },
                },
            },
            select: {
                id: true,
                name: true,
                name_ar: true,
                logo: true,
                description: true,
                phone: true,
                email: true,
                address: true,
                website: true,
                developer: {
                    select: {
                        id: true,
                        cover_image: true,
                        createdAt: true,
                        projects: {
                            select: {
                                id: true,
                            },
                        },
                        Broker: {
                            select: {
                                id: true,
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

    const developers = developersRaw
        .map((developer) => {
            const projectCount = developer.developer?.projects?.length || 0;
            const brokerCount = developer.developer?.Broker?.length || 0;

            return {
                id: developer.developer?.id,
                cover_image: developer.developer?.cover_image,
                createdAt: developer.developer?.createdAt,
                company: {
                    id: developer.id,
                    name: developer.name,
                    name_ar: developer.name_ar,
                    logo: developer.logo,
                    description: developer.description,
                    phone: developer.phone,
                    email: developer.email,
                    address: developer.address,
                    website: developer.website,
                },
                project_count: projectCount,
                broker_count: brokerCount,
            };
        })
        .filter((developer) => developer.id); // Filter out any entries where developer doesn't exist

    const pagination = {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
    };

    return { developers, pagination };
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
    const [developer, totalProjectCount] = await Promise.all([
        prisma.developer.findUnique({
            where: { id: developerId },
            include: {
                projects: {
                    take: 5,
                    select: {
                        id: true,
                        category: true,
                        image_urls: true,
                        project_name: true,
                        address: true,
                    },
                },
                company: {
                    select: {
                        name: true,
                        logo: true,
                        description: true,
                    },
                },
            },
        }),
        prisma.project.count({
            where: { developer_id: developerId },
        }),
    ]);

    if (!developer) throw new Error('Developer not found');

    // Format projects to match the required structure
    const formattedProjects = developer.projects.map((project) => ({
        id: project.id,
        category: project.category,
        image: project.image_urls.length > 0 ? project.image_urls[0] : null, // Only first image
        project_name: project.project_name,
        address: project.address,
    }));

    const admin_user = await prisma.adminUser.findFirst({
        where: {
            type: AdminUserType.MEMBER,
            company_id: developer.company_id,
        },
        select: {
            broker: true,
        },
        orderBy: {
            created_at: 'desc',
        },
    });

    return {
        id: developer.id,
        name: developer.company?.name,
        logo: developer.company?.logo,
        cover_image: developer.cover_image,
        description: developer.company?.description,
        project_count: totalProjectCount,
        projects: formattedProjects,
        broker: admin_user?.broker
            ? {
                  id: admin_user?.broker?.id,
                  name: admin_user?.broker?.name,
                  profile_pic: admin_user?.broker?.profile_pic,
                  country_code: admin_user?.broker?.country_code,
                  w_number: admin_user?.broker?.w_number,
                  email: admin_user?.broker?.email,
                  linkedin_link: admin_user?.broker?.linkedin_link,
                  ig_link: admin_user?.broker?.ig_link,
                  company: {
                      name: developer?.company?.name || '',
                  },
              }
            : null,
    };
};
