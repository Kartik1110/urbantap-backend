import {
    createPaginationObject,
    getUserAppliedJobIds,
    transformBrokerageData,
} from '@/helper';
import prisma from '@/utils/prisma';
import { CompanyType, Prisma } from '@prisma/client';

export const getBrokeragesService = async ({
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
              name: {
                  contains: search,
                  mode: 'insensitive' as Prisma.QueryMode,
              },
              type: CompanyType.Brokerage,
          }
        : {
              type: CompanyType.Brokerage,
          };

    const [brokeragesRaw, totalCount] = await Promise.all([
        prisma.company.findMany({
            where: whereClause,
            skip,
            take: pageSize,
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
                brokers: {
                    select: {
                        id: true,
                    },
                },
                brokerage: {
                    select: {
                        id: true,
                        ded: true,
                        rera: true,
                        service_areas: true,
                        about: true,
                    },
                },
            },
        }),
        prisma.company.count({ where: whereClause }),
    ]);

    // Get listing counts for all brokers in one query
    const allBrokerIds = brokeragesRaw.flatMap((b) =>
        b.brokers.map((br) => br.id)
    );

    const listingsByBroker = await prisma.listing.groupBy({
        by: ['broker_id'],
        where: {
            broker_id: {
                in: allBrokerIds,
            },
        },
        _count: {
            broker_id: true,
        },
    });

    // Convert to map for fast lookup
    const listingCountMap = new Map(
        listingsByBroker.map((item) => [item.broker_id, item._count.broker_id])
    );

    const brokerages = brokeragesRaw.map((brokerage) => {
        const brokerCount = brokerage.brokers.length;
        const listingCount = brokerage.brokers.reduce((sum, broker) => {
            return sum + (listingCountMap.get(broker.id) || 0);
        }, 0);

        return {
            ...brokerage.brokerage,
            company: {
                id: brokerage.id,
                name: brokerage.name,
                name_ar: brokerage.name_ar,
                logo: brokerage.logo,
                description: brokerage.description,
                phone: brokerage.phone,
                email: brokerage.email,
                address: brokerage.address,
                website: brokerage.website,
            },
            broker_count: brokerCount,
            listing_count: listingCount,
        };
    });

    const pagination = {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
    };

    return { brokerages, pagination };
};

export const createBrokerageService = async (data: {
    name: string;
    logo: string;
    description: string;
    ded?: string;
    rera?: string;
    contact_email?: string;
    contact_phone?: string;
    service_areas: string[];
    company_id: string;
}) => {
    return await prisma.brokerage.create({
        data,
    });
};

export const getBrokerageDetailsService = async (brokerageId: string) => {
    const brokerage = await prisma.brokerage.findUnique({
        where: { id: brokerageId },
        include: {
            brokers: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    w_number: true,
                },
            },
            listings: {
                // Include new direct listings
                select: {
                    id: true,
                    title: true,
                    min_price: true,
                    max_price: true,
                    image: true,
                },
            },
            company: true,
        },
    });

    if (!brokerage) throw new Error('Brokerage not found');

    const brokerIds = brokerage.brokers.map((b) => b.id);

    const brokerListings = await prisma.listing.findMany({
        where: {
            broker_id: { in: brokerIds },
        },
        select: {
            id: true,
            title: true,
            min_price: true,
            max_price: true,
            image: true,
        },
    });

    const totalListingsCount =
        brokerListings.length + brokerage.listings.length;

    return {
        id: brokerage.id,
        name: brokerage.company?.name,
        logo: brokerage.company?.logo,
        description: brokerage.company?.description,
        about: brokerage.about ?? '',
        ded: brokerage.ded,
        rera: brokerage.rera,
        contact: {
            email: brokerage.company?.email,
            phone: brokerage.company?.phone,
        },
        service_areas: brokerage.service_areas,
        broker_count: brokerage.brokers.length,
        brokers: brokerage.brokers,
        listings: [...brokerage.listings, ...brokerListings],
        properties_count: totalListingsCount,
        company: brokerage.company
            ? {
                  id: brokerage.company.id,
                  name: brokerage.company.name,
                  type: brokerage.company.type,
              }
            : null,
    };
};

export const getAboutService = async (id: string) => {
    const brokerage = await prisma.brokerage.findUnique({
        where: { id },
        select: {
            id: true,
            company: {
                select: {
                    name: true,
                    logo: true,
                    description: true,
                    email: true,
                    phone: true,
                },
            },
            about: true,
            ded: true,
            rera: true,
            service_areas: true,
            listings: {
                select: { id: true },
            },
            brokers: {
                select: { id: true },
            },
        },
    });

    if (!brokerage) throw new Error('Brokerage not found');

    const brokerIds = brokerage.brokers.map((b) => b.id);

    const brokerListingsCount = await prisma.listing.count({
        where: {
            broker_id: { in: brokerIds },
        },
    });

    const totalListingsCount = brokerListingsCount + brokerage.listings.length;

    return {
        id: brokerage.id,
        name: brokerage.company?.name,
        logo: brokerage.company?.logo,
        description: brokerage.company?.description,
        about: brokerage.about,
        ded: brokerage.ded,
        rera: brokerage.rera,
        service_areas: brokerage.service_areas,
        contact: {
            email: brokerage.company?.email || null,
            phone: brokerage.company?.phone || null,
        },
        listings_count: totalListingsCount,
    };
};

export const getListingsService = async (brokerageId: string) => {
    const brokers = await prisma.broker.findMany({
        where: { brokerageId },
        select: { id: true },
    });

    const brokerIds = brokers.map((b) => b.id);

    const listings = await prisma.listing.findMany({
        where: {
            admin_status: 'Approved',
            OR: [
                { brokerage_id: brokerageId }, // Direct listings
                { broker_id: { in: brokerIds } }, // Listings by brokerage's brokers
            ],
        },
        orderBy: { created_at: 'desc' },
        include: {
            broker: {
                select: {
                    id: true,
                    name: true,
                    profile_pic: true,
                    country_code: true,
                    w_number: true,
                    company: {
                        select: { name: true },
                    },
                },
            },
            listing_views: {
                select: {
                    count: true,
                },
            },
        },
    });

    const formattedListings = listings.map((listing: any) => {
        const recentViews = listing.listing_views?.[0]?.count || 0;

        return {
            listing: {
                ...listing,
            },
            recentViews,
            broker: listing.broker
                ? {
                      id: listing.broker.id,
                      name: listing.broker.name,
                      profile_pic: listing.broker.profile_pic,
                      country_code: listing.broker.country_code,
                      w_number: listing.broker.w_number,
                  }
                : {
                      id: '',
                      name: '',
                      profile_pic: '',
                      country_code: '',
                      w_number: '',
                  },
            company: {
                name: listing.broker?.company?.name || '',
            },
        };
    });

    return {
        listings: formattedListings,
        pagination: {
            total: formattedListings.length,
            page: 1,
            page_size: 10,
            total_pages: 1,
        },
    };
};

export const getBrokersService = async (id: string) => {
    const brokerage = await prisma.brokerage.findUnique({
        where: { id },
        include: {
            brokers: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    w_number: true,
                    profile_pic: true,
                },
            },
        },
    });

    if (!brokerage) throw new Error('Brokerage not found');

    return brokerage.brokers;
};

export const getJobsService = async (
    brokerageId: string,
    body: { page?: number; page_size?: number },
    userId: string
) => {
    const { page = 1, page_size = 10 } = body;
    const skip = (page - 1) * page_size;

    const [jobsRaw, appliedJobIds] = await Promise.all([
        prisma.job.findMany({
            where: {
                company: {
                    type: CompanyType.Brokerage,
                    brokerage: { id: brokerageId },
                },
            },
            select: {
                id: true,
                title: true,
                company_id: true,
                workplace_type: true,
                location: true,
                job_type: true,
                description: true,
                min_salary: true,
                max_salary: true,
                skills: true,
                currency: true,
                min_experience: true,
                max_experience: true,
                userId: true,
                created_at: true,
                updated_at: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        description: true,
                        type: true,
                        brokerage: {
                            select: {
                                id: true,
                                _count: {
                                    select: { listings: true },
                                },
                            },
                        },
                    },
                },
            },
            skip,
            take: page_size,
            orderBy: { created_at: 'desc' },
        }),
        getUserAppliedJobIds(userId),
    ]);

    const jobs = jobsRaw.map((job) => {
        const { company, ...jobWithoutCompany } = job;
        return {
            ...jobWithoutCompany,
            brokerage: transformBrokerageData(company),
            applied: appliedJobIds.has(job.id),
        };
    });

    return {
        jobs,
        pagination: createPaginationObject(jobs.length, 1, 10),
    };
};
