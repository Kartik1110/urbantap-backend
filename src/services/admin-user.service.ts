import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { JobInput } from '../schema/job.schema';
import {
    Category,
    Prisma,
    PostPosition,
    CompanyType,
    Listing,
    Admin_Status,
} from '@prisma/client';
import { DecodedAdminUser } from '../utils/verifyToken';
import logger from '../utils/logger';
import { geocodeAddress } from '../utils/geocoding';

export const signupAdmin = async (
    email: string,
    password: string,
    companyId: string
) => {
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { developerId: true, brokerageId: true, type: true },
    });

    if (!company) throw new Error('Company not found');

    const hashedPassword = await bcrypt.hash(password, 10);

    return await prisma.adminUser.create({
        data: {
            email,
            password: hashedPassword,
            companyId,
        },
    });
};

export const loginAdmin = async (email: string, password: string) => {
    const user = await prisma.adminUser.findUnique({ where: { email } });

    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const company = await prisma.company.findUnique({
        where: { id: user.companyId },
        select: { type: true, developerId: true, brokerageId: true },
    });

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            companyId: user.companyId,
            type: company?.type,
            entityId:
                company &&
                (company.type === CompanyType.Developer
                    ? company.developerId
                    : company.brokerageId),
        },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );

    return token;
};

export const changeAdminPassword = async (
    adminUserId: string,
    old_password: string,
    new_password: string
) => {
    const user = await prisma.adminUser.findUnique({
        where: { id: adminUserId },
    });

    if (!user) throw new Error('Admin user not found');

    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) throw new Error('Old password is incorrect');

    const hashedNew = await bcrypt.hash(new_password, 10);

    await prisma.adminUser.update({
        where: { id: adminUserId },
        data: { password: hashedNew },
    });
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
            companyId: true,
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

    if (!adminUser.companyId) {
        throw new Error('This admin is not linked to any company');
    }

    await prisma.company.update({
        where: { id: adminUser.companyId },
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

export const createProjectService = async (data: any) => {
    return await prisma.project.create({
        data,
    });
};

export const getProjectsService = async (developerId: string) => {
    return await prisma.project.findMany({
        where: { developer_id: developerId },
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
    images: string[];
    position: PostPosition;
    company_id: string;
    rank: number;
}) => {
    return await prisma.companyPost.create({ data });
};

export const editCompanyPostService = async (
    id: string,
    updateData: {
        title?: string;
        caption?: string;
        images?: string[];
        position?: PostPosition;
    }
) => {
    return await prisma.companyPost.update({
        where: { id },
        data: updateData,
    });
};

export const getAllCompanyPostsService = async (companyId: string) => {
    return await prisma.companyPost.findMany({
        where: {
            company_id: companyId,
        },
        orderBy: {
            rank: 'asc',
        },
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    developerId: true,
                    brokerageId: true,
                },
            },
        },
    });
};

export const getCompanyPostByIdService = async (postId: string) => {
    return await prisma.companyPost.findUnique({
        where: {
            id: postId,
        },
        include: {
            company: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    developerId: true,
                    brokerageId: true,
                },
            },
        },
    });
};

export const createJobService = async (
    data: JobInput & {
        adminUserId: string;
        companyId: string;
    }
) => {
    return await prisma.job.create({
        data: {
            title: data.title,
            company_id: data.companyId,
            workplace_type: data.workplace_type,
            location: data.location,
            job_type: data.job_type,
            description: data.description,
            currency: data.currency,
            min_salary: data.min_salary ?? null,
            max_salary: data.max_salary ?? null,
            skills: data.skills ?? null,
            min_experience: data.min_experience ?? null,
            max_experience: data.max_experience ?? null,
            adminUserId: data.adminUserId,
            userId: null,
        },
    });
};

export const getJobsForCompanyService = async (companyId: string) => {
    return await prisma.job.findMany({
        where: {
            company_id: companyId,
        },
        orderBy: {
            created_at: 'desc',
        },
    });
};

export const getJobByIdService = async (jobId: string, companyId: string) => {
    return await prisma.job.findUnique({
        where: {
            id: jobId,
            company_id: companyId,
        },
    });
};

export const getJobApplicationsService = async (
    jobId: string,
    companyId: string
) => {
    const job = await prisma.job.findUnique({
        where: {
            id: jobId,
            company_id: companyId,
        },
    });

    if (!job) {
        throw new Error('Job not found');
    }

    return await prisma.application.findMany({
        where: {
            job_id: jobId,
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    country_code: true,
                    w_number: true,
                    role: true,
                },
            },
            job: {
                select: {
                    title: true,
                },
            },
        },
    });
};

export const getBrokersService = async (companyId: string) => {
    return await prisma.broker.findMany({
        where: {
            company_id: companyId,
        },
    });
};

export const getListingsForBrokerageService = async (brokerageId: string) => {
    return await prisma.listing.findMany({
        where: {
            brokerage_id: brokerageId,
        },
    });
};

export const createListingService = async (
    data: Listing,
    brokerageId: string
) => {
    return await prisma.listing.create({
        data: {
            ...data,
            brokerage_id: brokerageId,
        },
    });
};

/* Bulk insert listings */
export const bulkInsertListingsAdminService = async (
    listings: Listing[],
    brokerageId: string
) => {
    try {
        const enrichedListings = [];

        for (const listing of listings) {
            let enrichedListing = {
                ...listing,
                admin_status: Admin_Status.Pending,
                brokerage_id: brokerageId,
            };

            // Add locality information if address is provided
            if (listing.address) {
                const rawAddress = `${listing.address}, Dubai`;
                const geocodeResult = await geocodeAddress(rawAddress);

                if (geocodeResult) {
                    enrichedListing = {
                        ...enrichedListing,
                        address: geocodeResult.formatted_address,
                        locality: geocodeResult.locality,
                    };
                    console.log(
                        `✅ Geocoded listing with address: ${listing.address}`
                    );
                } else {
                    console.log(
                        `⚠️ Unable to geocode address: ${listing.address}`
                    );
                }
            }

            enrichedListings.push(enrichedListing);

            // Add a small delay to respect API limits (100ms)
            if (listings.length > 1) {
                await new Promise((resolve) => global.setTimeout(resolve, 100));
            }
        }

        // Use createMany for bulk insertion
        const result = await prisma.listing.createMany({
            data: enrichedListings,
            skipDuplicates: true,
        });

        return result;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};
