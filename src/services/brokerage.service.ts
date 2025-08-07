import prisma from '../utils/prisma';
import { CompanyType, Prisma } from '@prisma/client';
import logger from '../utils/logger';

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
                logo: true,
                brokers: {
                    select: {
                        id: true,
                    },
                },
                brokerage: {
                    select: {
                        id: true,
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
            id: brokerage.id,
            brokerage_id: brokerage.brokerage?.id || null,
            name: brokerage.name,
            logo: brokerage.logo,
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
    try {
        console.log('Starting getBrokerageDetailsService with ID:', brokerageId);

        // First, test if the brokerage exists with a simple query
        const brokerageExists = await prisma.brokerage.findUnique({
            where: { id: brokerageId },
            select: { id: true }
        });

        console.log('Brokerage exists check:', !!brokerageExists);
        if (!brokerageExists) {
            throw new Error(`Brokerage with ID ${brokerageId} not found`);
        }

        // Get the brokerage with its brokers
        const brokerage = await prisma.brokerage.findUnique({
            where: { id: brokerageId },
            include: {
                brokers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        w_number: true,
                        profile_pic: true,
                        designation: true,
                        country_code: true,
                    },
                },
            },
        });

        console.log('Brokerage found:', !!brokerage);
        if (!brokerage) throw new Error('Brokerage not found');

        // Get the company associated with this brokerage
        const company = await prisma.company.findFirst({
            where: { brokerageId: brokerageId },
            select: {
                id: true,
                name: true,
                logo: true,
                description: true,
                email: true,
                phone: true,
                website: true,
                address: true,
                type: true,
            },
        });

        console.log('Company found:', !!company);

        // Get broker IDs for listing queries
        const brokerIds = brokerage.brokers.map((b) => b.id);
        console.log('Broker IDs:', brokerIds);

        // Initialize listings arrays
        let brokerListings: any[] = [];
        let directListings: any[] = [];

        // Only query for broker listings if there are brokers
        if (brokerIds.length > 0) {
            brokerListings = await prisma.listing.findMany({
                where: {
                    broker_id: { in: brokerIds },
                    admin_status: 'Approved',
                },
                select: {
                    id: true,
                    title: true,
                    min_price: true,
                    max_price: true,
                    image: true,
                    type: true,
                    category: true,
                    city: true,
                    address: true,
                    created_at: true,
                },
                orderBy: { created_at: 'desc' },
            });
        }

        console.log('Broker listings count:', brokerListings.length);

        // Get direct listings associated with the brokerage
        directListings = await prisma.listing.findMany({
            where: {
                brokerage_id: brokerageId,
                admin_status: 'Approved',
            },
            select: {
                id: true,
                title: true,
                min_price: true,
                max_price: true,
                image: true,
                type: true,
                category: true,
                city: true,
                address: true,
                created_at: true,
            },
            orderBy: { created_at: 'desc' },
        });

        console.log('Direct listings count:', directListings.length);

        // Combine all listings
        const allListings = [...brokerListings, ...directListings];
        const totalListingsCount = allListings.length;

        const result = {
            id: brokerage.id,
            name: company?.name || '',
            logo: company?.logo || '',
            description: company?.description || '',
            about: brokerage.about || '',
            ded: brokerage.ded,
            rera: brokerage.rera,
            contact: {
                email: company?.email || '',
                phone: company?.phone || '',
                website: company?.website || '',
                address: company?.address || '',
            },
            service_areas: brokerage.service_areas || [],
            broker_count: brokerage.brokers.length,
            brokers: brokerage.brokers,
            listings: allListings,
            properties_count: totalListingsCount,
            company: company
                ? {
                    id: company.id,
                    name: company.name,
                    type: company.type,
                }
                : null,
            created_at: brokerage.created_at,
            updated_at: brokerage.updated_at,
        };

        console.log('Service completed successfully');
        return result;

    } catch (error) {
        logger.error('Error in getBrokerageDetailsService:', error);
        throw error;
    }
};

export const getAboutService = async (id: string) => {
    const brokerage = await prisma.brokerage.findUnique({
        where: { id },
        select: {
            id: true,
            about: true,
            ded: true,
            rera: true,
            service_areas: true,
            brokers: {
                select: { id: true },
            },
        },
    });

    if (!brokerage) throw new Error('Brokerage not found');

    // Get the company associated with this brokerage
    const company = await prisma.company.findFirst({
        where: { brokerageId: id },
        select: {
            id: true,
            name: true,
            logo: true,
            description: true,
            email: true,
            phone: true,
        },
    });

    const brokerIds = brokerage.brokers.map((b) => b.id);

    // Get listings count for brokers
    const brokerListingsCount = await prisma.listing.count({
        where: {
            broker_id: { in: brokerIds },
            admin_status: 'Approved',
        },
    });

    // Get direct listings count for the brokerage
    const directListingsCount = await prisma.listing.count({
        where: {
            brokerage_id: id,
            admin_status: 'Approved',
        },
    });

    const totalListingsCount = brokerListingsCount + directListingsCount;

    return {
        id: brokerage.id,
        name: company?.name || '',
        logo: company?.logo || '',
        description: company?.description || '',
        about: brokerage.about,
        ded: brokerage.ded,
        rera: brokerage.rera,
        service_areas: brokerage.service_areas,
        contact: {
            email: company?.email || '',
            phone: company?.phone || '',
        },
        totalListingsCount,
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

export const getJobsService = async (id: string) => {
    const jobs = await prisma.job.findMany({
        where: { company: { brokerage: { id } } },
        select: {
            id: true,
            title: true,
            location: true,
            min_salary: true,
            max_salary: true,
            job_type: true,
            min_experience: true,
            max_experience: true,
            created_at: true,
        },
    });

    return jobs;
};
