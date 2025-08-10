import prisma from '../utils/prisma';

// Private helper function to create pagination object
export const createPaginationObject = (
    total: number,
    page: number,
    page_size: number
) => ({
    total,
    totalPages: Math.ceil(total / page_size),
    page,
    page_size,
});

// Private helper function to transform brokerage data
export const transformBrokerageData = (company: any) => {
    if (!company?.brokerage) return null;

    const { _count, ...brokerageData } = company.brokerage;
    return {
        id: brokerageData.id,
        listings_count: _count.listings,
        company: {
            id: company.id,
            name: company.name,
            logo: company.logo,
            description: company.description,
        },
    };
};

// Private helper function to check if user has applied to jobs
export const getUserAppliedJobIds = async (
    userId: string
): Promise<Set<string>> => {
    if (!userId) return new Set();

    const userApplications = await prisma.application.findMany({
        where: { user_id: userId },
        select: { job_id: true },
    });
    return new Set(userApplications.map((app) => app.job_id));
};
