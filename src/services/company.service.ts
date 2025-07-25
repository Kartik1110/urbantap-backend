import prisma from '../utils/prisma';
import { Company, CompanyType } from '@prisma/client';

interface CompanyUpdateInput {
    name?: string;
    name_ar?: string;
    description?: string;
    logo?: string;
    type?: CompanyType;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export const bulkInsertCompaniesService = async (companies: Company[]) => {
    // 1. Create all companies
    const createdCompanies = await Promise.all(
        companies.map(async (company) => {
            const createdCompany = await prisma.company.create({
                data: company,
            });

            // 2. Automatically create Developer or Brokerage based on type
            if (company.type === CompanyType.Developer) {
                const developer = await prisma.developer.create({
                    data: {
                        name: createdCompany.name,
                        logo: createdCompany.logo,
                        description: createdCompany.description,
                        email: createdCompany.email,
                        phone: createdCompany.phone,
                        company_id: createdCompany.id,
                    },
                });

                // 3. Update company with developerId
                await prisma.company.update({
                    where: { id: createdCompany.id },
                    data: {
                        developerId: developer.id,
                    },
                });
            } else if (company.type === CompanyType.Brokerage) {
                const brokerage = await prisma.brokerage.create({
                    data: {
                        name: createdCompany.name,
                        logo: createdCompany.logo,
                        description: createdCompany.description,
                        contact_email: createdCompany.email,
                        contact_phone: createdCompany.phone,
                        company_id: createdCompany.id,
                        service_areas: [],
                    },
                });

                // 4. Update company with brokerageId
                await prisma.company.update({
                    where: { id: createdCompany.id },
                    data: {
                        brokerageId: brokerage.id,
                    },
                });
            }

            return createdCompany;
        })
    );

    return createdCompanies.map((company) => company.id);
};

export const getCompaniesService = async ({
    search = '',
}: {
    search: string;
}) => {
    return await prisma.company.findMany({
        where: search
            ? {
                name: {
                    contains: search,
                    mode: 'insensitive',
                },
            }
            : {},
    });
};

export const getBrokersByCompanyIdService = async (companyId: string) => {
    return await prisma.broker.findMany({
        where: {
            company_id: companyId,
        },
    });
};

export const updateCompanyService = async (
    companyId: string,
    data: CompanyUpdateInput
) => {
    const updatedCompany = await prisma.company.update({
        where: { id: companyId },
        data,
    });

    return updatedCompany;
};

export const getListingsByCompanyIdService = async (
    companyId: string,
    skip: number,
    limit: number
) => {
    // Step 1: Find broker IDs for the given company
    const brokers = await prisma.broker.findMany({
        where: {
            company_id: companyId,
        },
        select: {
            id: true,
        },
    });

    const brokerIds = brokers.map((broker) => broker.id);

    if (brokerIds.length === 0) {
        return { listings: [], totalCount: 0 };
    }

    // Step 2: Fetch listings where broker_id is in those brokerIds
    const [listings, totalCount] = await Promise.all([
        prisma.listing.findMany({
            where: {
                broker_id: {
                    in: brokerIds,
                },
            },
            skip,
            take: limit,
            orderBy: {
                created_at: 'desc',
            },
        }),
        prisma.listing.count({
            where: {
                broker_id: {
                    in: brokerIds,
                },
            },
        }),
    ]);

    return { listings, totalCount };
};

export const getCompaniesByUserIdService = async () => {
    const companies = await prisma.company.findMany({
        // where: {
        //   user_id: userId,
        // }
        // orderBy: {
        //   createdAt: 'desc', // optional
        // },
    });

    return companies;
};

export const getCompanyByIdService = async (companyId: string) => {
    return await prisma.company.findUnique({
        where: {
            id: companyId,
        },
        include: {
            brokers: {
                select: {
                    id: true,
                    name: true,
                    profile_pic: true,
                    Developer: {
                        select: {
                            name: true,
                        },
                    },
                    Brokerage: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
            jobs: {
                select: {
                    id: true,
                },
            },
        },
    });
};

export const getAllCompanyPostsService = async () => {
    return await prisma.companyPost.findMany({
        orderBy: {
            created_at: 'desc',
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