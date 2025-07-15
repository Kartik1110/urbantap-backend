import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const getBrokeragesService = async ({
    page,
    pageSize,
    search,
}: {
    page: number;
    pageSize: number;
    search?: string;
}) => {
    try {
        const skip = (page - 1) * pageSize;

        const whereClause = search
            ? {
                  name: {
                      contains: search,
                      mode: 'insensitive' as Prisma.QueryMode,
                  },
              }
            : {};

        const [brokeragesRaw, totalCount] = await Promise.all([
            prisma.brokerage.findMany({
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
                },
            }),
            prisma.brokerage.count({ where: whereClause }),
        ]);

        // Get listing counts for all brokers in one query
        const allBrokerIds = brokeragesRaw.flatMap((b) => b.brokers.map((br) => br.id));

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
    } catch (error) {
        throw error;
    }
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
    try {
        return await prisma.brokerage.create({
            data,
        });
    } catch (error) {
        throw error;
    }
};

export const getBrokerageDetailsService = async (brokerageId: string) => {
    try {
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
                listings: {   // Include new direct listings
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

        const totalListingsCount = brokerListings.length + brokerage.listings.length;

        return {
            id: brokerage.id,
            name: brokerage.name,
            logo: brokerage.logo,
            description: brokerage.description,
            about: brokerage.about ?? "",
            ded: brokerage.ded,
            rera: brokerage.rera,
            contact: {
                email: brokerage.contact_email,
                phone: brokerage.contact_phone,
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
    } catch (error) {
        throw error;
    }
};

export const getAboutService = async (id: string) => {
  const brokerage = await prisma.brokerage.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      logo: true,
      description: true,
      about: true,
      ded: true,
      rera: true,
      contact_email: true,
      contact_phone: true,
      service_areas: true,
    },
  });

  if (!brokerage) throw new Error('Brokerage not found');

  return {
    ...brokerage,
    contact: {
      email: brokerage.contact_email,
      phone: brokerage.contact_phone,
    },
  };
};

export const getListingsService = async (brokerageId: string) => {
  try {
    const brokers = await prisma.broker.findMany({
      where: { brokerageId },
      select: { id: true },
    });

    const brokerIds = brokers.map((b) => b.id);

    const listings = await prisma.listing.findMany({
      where: {
        admin_status: 'Approved',
        OR: [
          { brokerage_id: brokerageId },         // Direct listings
          { broker_id: { in: brokerIds } },      // Listings by brokerage's brokers
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
  } catch (error) {
    throw error;
  }
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
    where: { brokerage_id: id },
    select: {
      id: true,
      title: true,
      location: true,
      min_salary: true,
      max_salary: true,
      job_type: true,    
      min_experience: true,
      max_experience: true,
      createdAt: true,
    },
  });

  return jobs;
};
