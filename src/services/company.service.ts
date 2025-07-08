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
    await prisma.company.createMany({
        data: companies,
    });

    // Get the IDs of the newly created companies
    const createdCompanies = await prisma.company.findMany({
        where: {
            name: {
                in: companies.map((company) => company.name),
            },
        },
        select: {
            id: true,
        },
    });

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
