import logger from '../utils/logger';
import prisma from '../utils/prisma';
import {
    Listing,
    Admin_Status,
    NotificationType,
    City,
    Bathrooms,
    Bedrooms,
    Furnished,
    Type,
    Rental_frequency,
    RequestStatus,
    Quarter,
    Type_of_use,
    DealType,
    CurrentStatus,
    Views,
    Market,
    Category,
} from '@prisma/client';
import generateListingFromText from '../scripts/generate-listings';
import { Prisma } from '@prisma/client';
import { geocodeAddress } from '../utils/geocoding';
// Dynamic import based on environment variable
const PROPERTY_DATA_PATH = process.env.PROPERTY_DATA_PATH || 'v1';
let propertiesData: MergedPropertyData;

// Dynamic import based on environment variable
(async () => {
    try {
        const module = await import(
            `../data/property-data-${PROPERTY_DATA_PATH}`
        );
        propertiesData = module.default;
    } catch (error) {
        logger.error(
            `Failed to load property data for version ${PROPERTY_DATA_PATH}:`,
            error
        );

        // Fallback to v2
        const fallbackModule = await import('../data/property-data-v2');
        propertiesData = fallbackModule.default;
    }
})();

import {
    calculateAppreciationDataPoints,
    calculateBreakEvenPeriod,
    calculateBreakEvenPeriodByType,
    calculateCapitalGains,
    calculateCumulativeProfitPerYearByType,
    calculateExpectedRental,
    calculateRentalDemandIncrease,
    calculateRoiDataPointsByType,
    calculateCumulativeROIByType,
    getCurrentRentalPrice,
    getInvestmentGoalsWithROI,
    getPropertyData,
    PropertyDataPoint,
    calculatePropertyROI,
    getListingAppreciationInYear,
    getRentalPriceInYear,
    MergedPropertyData,
} from '../utils/roiReport';

declare const fetch: typeof globalThis.fetch;

/* Get listings */
interface ListingFilters {
    [key: string]: any; // TODO: Define the type of filters
}

export const getListingByIdService = async (id: string, userId: string) => {
    try {
        // User is always authenticated, so check if they can see the listing
        // They can see: approved listings OR their own listings regardless of admin status
        const listing = await prisma.listing.findFirst({
            where: {
                id,
                OR: [
                    { admin_status: Admin_Status.Approved },
                    {
                        AND: [
                            { broker: { user_id: userId } },
                            { admin_status: { not: Admin_Status.Approved } },
                        ],
                    },
                ],
            },
            include: {
                broker: {
                    select: {
                        id: true,
                        name: true,
                        profile_pic: true,
                        country_code: true,
                        w_number: true,
                        email: true,
                        linkedin_link: true,
                        ig_link: true,
                        user_id: true,
                        company: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                listing_views: true,
            },
        });

        if (!listing) {
            return {
                listing: {},
                broker: {
                    id: '',
                    name: '',
                    profile_pic: '',
                    country_code: '',
                    w_number: '',
                },
                company: { name: '' },
            };
        }

        // Now that we know the listing exists, update the view count
        const now = new Date();

        // Try to upsert the view row safely
        const view = await prisma.listingView.findUnique({
            where: { listing_id: id },
        });

        if (view) {
            const hoursPassed =
                (now.getTime() - new Date(view.viewed_at).getTime()) /
                (1000 * 60 * 60);

            if (hoursPassed > 48) {
                // const minutesPassed = (now.getTime() - new Date(view.viewed_at).getTime()) / (1000 * 60);
                // if (minutesPassed > 1) {
                await prisma.listingView.update({
                    where: { listing_id: id },
                    data: {
                        count: 1,
                        viewed_at: now,
                    },
                });
            } else {
                await prisma.listingView.update({
                    where: { listing_id: id },
                    data: {
                        count: { increment: 1 },
                    },
                });
            }
        } else {
            try {
                await prisma.listingView.create({
                    data: {
                        listing_id: id,
                        viewed_at: now,
                        count: 1,
                    },
                });
            } catch (error) {
                // If create fails due to race condition, fallback to update
                if (
                    typeof error === 'object' &&
                    error !== null &&
                    'code' in error &&
                    (error as { code?: string }).code === 'P2002'
                ) {
                    await prisma.listingView.update({
                        where: { listing_id: id },
                        data: {
                            count: { increment: 1 },
                        },
                    });
                } else {
                    throw error;
                }
            }
        }
        const recentViews = listing.listing_views?.[0]?.count || 0;
        const { broker, ...listingWithoutBroker } = listing;
        return {
            listing: listingWithoutBroker,
            recentViews,
            broker: {
                id: broker.id,
                name: broker.name,
                profile_pic: broker.profile_pic,
                country_code: broker.country_code,
                w_number: broker.w_number,
                email: broker.email,
                linkedin_link: broker.linkedin_link,
                ig_link: broker.ig_link,
            },
            company: {
                name: broker.company?.name || '',
            },
        };
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const getListingsService = async (
    filters: {
        views_feature?: boolean;
        looking_for?: boolean;
        category?: 'Ready_to_move' | 'Off_plan' | 'Rent';
        min_price?: number;
        max_price?: number;
        min_sqft?: number;
        max_sqft?: number;
        city?: City;
        address?: string;
        handover_year?: number[];
        handover_quarter?: Quarter[];
        type_of_use?: Type_of_use[];
        deal_type?: DealType[];
        current_status?: CurrentStatus[];
        views?: Views[];
        market?: Market[];
        parking_space?: boolean;
        service_charge?: number;
        construction_progress?: number;
        gfa_bua?: number;
        floor_area_ratio?: number;
        no_of_bathrooms?: Bathrooms[];
        no_of_bedrooms?: Bedrooms[];
        furnished?: Furnished[];
        type?: Type[];
        rental_frequency?: Rental_frequency[];
        project_age?: ('Less_than_5_years' | 'More_than_5_years')[];
        payment_plan?: ('Payment_done' | 'Payment_Pending')[];
        sale_type?: ('Direct' | 'Resale')[];
        amenities?: string[];
        search?: string;
        sort_by?: 'price_high_to_low' | 'price_low_to_high';
        page?: number;
        page_size?: number;
    } & ListingFilters
): Promise<{
    listings: Array<{
        listing: Partial<Listing> & { recentViews?: number };
        broker: {
            id: string;
            name: string;
            profile_pic: string;
            country_code: string;
            w_number: string;
        };
        company: {
            name: string;
        };
    }>;
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}> => {
    try {
        const { page = 1, page_size = 10, sort_by, ...filterParams } = filters;

        // Remove these properties from filterParams before constructing whereCondition
        const skip = (page - 1) * page_size;

        // ---------- Non-trending (default) logic ----------
        const {
            type,
            no_of_bathrooms,
            no_of_bedrooms,
            furnished,
            rental_frequency,
            project_age,
            payment_plan,
            sale_type,
            amenities,
            min_price,
            max_price,
            min_sqft,
            max_sqft,
            looking_for,
            category,
            city,
            address,
            handover_year,
            handover_quarter,
            type_of_use,
            deal_type,
            current_status,
            views,
            market,
            // eslint-disable-next-line
            search,
            ...restFilters
        } = filterParams;

        // Base WHERE condition with admin_status
        const whereCondition = {
            AND: [
                { admin_status: Admin_Status.Approved },
                {
                    broker: {
                        sentToConnectionRequests: {
                            none: { status: RequestStatus.Blocked },
                        },
                    },
                },
                // Add specific filters one by one
                ...(looking_for !== undefined ? [{ looking_for }] : []),
                ...(category ? [{ category }] : []),
                ...(city ? [{ city }] : []),
                ...(address
                    ? [{ address: { contains: address, mode: 'insensitive' } }]
                    : []),
                ...(handover_year?.length
                    ? [{ handover_year: { in: handover_year } }]
                    : []),
                ...(handover_quarter?.length
                    ? [{ handover_quarter: { in: handover_quarter } }]
                    : []),
                ...(type_of_use?.length
                    ? [{ type_of_use: { in: type_of_use } }]
                    : []),
                ...(deal_type?.length
                    ? [
                          {
                              OR: [
                                  { deal_type: { in: deal_type } },
                                  {
                                      AND: [
                                          { deal_type: null },
                                          {
                                              OR: [
                                                  ...(deal_type.includes(
                                                      DealType.Selling
                                                  )
                                                      ? [
                                                            {
                                                                category:
                                                                    Category.Ready_to_move,
                                                            },
                                                            {
                                                                category:
                                                                    Category.Off_plan,
                                                            },
                                                        ]
                                                      : []),
                                                  ...(deal_type.includes(
                                                      DealType.Rental
                                                  )
                                                      ? [
                                                            {
                                                                category:
                                                                    Category.Rent,
                                                            },
                                                        ]
                                                      : []),
                                              ],
                                          },
                                      ],
                                  },
                              ],
                          },
                      ]
                    : []),
                ...(current_status?.length
                    ? [{ current_status: { in: current_status } }]
                    : []),
                ...(views?.length ? [{ views: { in: views } }] : []),
                ...(market?.length ? [{ market: { in: market } }] : []),
                ...(filters.parking_space !== undefined
                    ? [{ parking_space: filters.parking_space }]
                    : []),
                ...(filters.service_charge !== undefined
                    ? [{ service_charge: filters.service_charge }]
                    : []),
                ...(filters.construction_progress !== undefined
                    ? [{ construction_progress: filters.construction_progress }]
                    : []),
                ...(filters.gfa_bua !== undefined
                    ? [{ gfa_bua: filters.gfa_bua }]
                    : []),
                ...(filters.floor_area_ratio !== undefined
                    ? [{ floor_area_ratio: filters.floor_area_ratio }]
                    : []),

                // Price range condition
                ...(min_price || max_price
                    ? [
                          {
                              AND: [
                                  ...(min_price
                                      ? [{ min_price: { gte: min_price } }]
                                      : []),
                                  ...(max_price
                                      ? [{ max_price: { lte: max_price } }]
                                      : []),
                              ],
                          },
                      ]
                    : []),

                // Square footage condition
                ...(min_sqft || max_sqft
                    ? [
                          {
                              sq_ft: {
                                  ...(min_sqft && { gte: min_sqft }),
                                  ...(max_sqft && { lte: max_sqft }),
                              },
                          },
                      ]
                    : []),

                // Array filters
                ...(no_of_bathrooms?.length
                    ? [{ no_of_bathrooms: { in: no_of_bathrooms } }]
                    : []),

                ...(no_of_bedrooms?.length
                    ? [{ no_of_bedrooms: { in: no_of_bedrooms } }]
                    : []),
                ...(furnished?.length
                    ? [{ furnished: { in: furnished } }]
                    : []),
                ...(type?.length ? [{ type: { in: type } }] : []),
                ...(rental_frequency?.length
                    ? [{ rental_frequency: { in: rental_frequency } }]
                    : []),
                ...(project_age?.length
                    ? [{ project_age: { in: project_age } }]
                    : []),
                ...(payment_plan?.length
                    ? [{ payment_plan: { in: payment_plan } }]
                    : []),
                ...(sale_type?.length
                    ? [{ sale_type: { in: sale_type } }]
                    : []),
                ...(amenities?.length
                    ? [{ amenities: { hasSome: amenities } }]
                    : []),

                // Add any remaining filters
                ...Object.entries(restFilters).map(([key, value]) => ({
                    [key]: value,
                })),
            ].filter(Boolean),
        };

        // Remove the filterParams from being spread directly into the AND array
        delete filterParams.page;
        delete filterParams.page_size;

        const normalizedSearch = filters.search?.trim().toLowerCase();

        const searchConditions: Prisma.ListingWhereInput = normalizedSearch
            ? {
                  OR: [
                      {
                          address: {
                              contains: normalizedSearch,
                              mode: 'insensitive' as Prisma.QueryMode,
                          },
                      },
                      {
                          locality: {
                              contains: normalizedSearch,
                              mode: 'insensitive' as Prisma.QueryMode,
                          },
                      },
                      {
                          city: {
                              equals: Object.values(City).find(
                                  (c) => c.toLowerCase() === normalizedSearch
                              ) as City | undefined, // Safely cast to enum
                          },
                      },
                  ],
              }
            : {};

        // Get total count for pagination
        const total = await prisma.listing.count({
            where: {
                ...whereCondition,
                ...searchConditions,
            },
        });

        // Apply sorting logic right before pagination
        let orderByClause: any = { created_at: 'desc' }; // Default sorting

        if (sort_by === 'price_high_to_low') {
            orderByClause = { max_price: 'desc' };
        } else if (sort_by === 'price_low_to_high') {
            orderByClause = { max_price: 'asc' };
        }

        const listings = await prisma.listing.findMany({
            where: {
                ...whereCondition,
                ...searchConditions,
            },
            skip,
            take: page_size,
            orderBy: orderByClause,
            include: {
                broker: {
                    select: {
                        id: true,
                        name: true,
                        profile_pic: true,
                        country_code: true,
                        w_number: true,
                        company: {
                            select: {
                                name: true,
                            },
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

        if (listings.length === 0) {
            return {
                listings: [
                    {
                        listing: {},
                        broker: {
                            id: '',
                            name: '',
                            profile_pic: '',
                            country_code: '',
                            w_number: '',
                        },
                        company: { name: '' },
                    },
                ],
                pagination: {
                    total: 0,
                    page,
                    page_size,
                    total_pages: 0,
                },
            };
        }

        const formattedListings = listings.map((listing: any) => {
            const { broker, ...listingWithoutBroker } = listing;
            const recentViews = listing.listing_views?.[0]?.count || 0;

            return {
                listing: listingWithoutBroker,
                recentViews,
                broker: {
                    id: broker.id,
                    name: broker.name,
                    profile_pic: broker.profile_pic,
                    country_code: broker.country_code,
                    w_number: broker.w_number,
                },
                company: {
                    name: broker.company?.name || '',
                },
            };
        });

        return {
            listings: formattedListings,
            pagination: {
                total,
                page,
                page_size,
                total_pages: Math.ceil(total / page_size),
            },
        };
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

export const getFeaturedListingsService = async (
    page: number = 1,
    page_size: number = 10,
    filters: {
        deal_type?: DealType[];
        [key: string]: any;
    } = {}
) => {
    const now = new Date();
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000);

    // Log the filters being applied
    logger.info(`Featured listings filters: ${JSON.stringify(filters)}`);

    // Clean up old views
    await prisma.listingView.updateMany({
        where: {
            viewed_at: {
                lt: since,
            },
        },
        data: {
            count: 0,
            viewed_at: now,
        },
    });

    // Build where condition with filters
    const whereCondition = {
        AND: [
            { admin_status: Admin_Status.Approved },
            {
                listing_views: {
                    some: {
                        viewed_at: {
                            gte: since,
                        },
                    },
                },
            },
            // Add deal_type filter if provided
            ...(filters.deal_type?.length
                ? [
                      {
                          OR: [
                              { deal_type: { in: filters.deal_type } },
                              {
                                  AND: [
                                      { deal_type: null },
                                      {
                                          OR: [
                                              ...(filters.deal_type.includes(
                                                  DealType.Selling
                                              )
                                                  ? [
                                                        {
                                                            category:
                                                                Category.Ready_to_move,
                                                        },
                                                        {
                                                            category:
                                                                Category.Off_plan,
                                                        },
                                                    ]
                                                  : []),
                                              ...(filters.deal_type.includes(
                                                  DealType.Rental
                                              )
                                                  ? [
                                                        {
                                                            category:
                                                                Category.Rent,
                                                        },
                                                    ]
                                                  : []),
                                          ],
                                      },
                                  ],
                              },
                          ],
                      },
                  ]
                : []),
        ],
    };

    // Log the where condition being applied
    logger.info(
        `Featured listings where condition: ${JSON.stringify(whereCondition)}`
    );

    // Get total count of listings with views in the last 48 hours (limited to 30 per deal type)
    const totalCount = await prisma.listing.count({
        where: whereCondition,
    });

    // Calculate max listings based on deal type filter
    let maxTotalListings = totalCount;
    if (filters.deal_type?.length === 1) {
        // If only one deal type is selected, limit to 30 for that type
        maxTotalListings = Math.min(totalCount, 30);
    } else {
        // If no deal type filter or multiple types, limit to 60 (30 rental + 30 selling)
        maxTotalListings = Math.min(totalCount, 60);
    }

    logger.info(
        `Featured listings total count: ${totalCount}, max listings: ${maxTotalListings}`
    );

    const skip = (page - 1) * page_size;
    const take = Math.min(page_size, maxTotalListings - skip); // Adjust take based on remaining listings

    // If skip exceeds the total available listings, return empty result
    if (skip >= maxTotalListings) {
        return {
            listings: [],
            pagination: {
                page,
                page_size,
                total: maxTotalListings,
                totalPages: Math.ceil(maxTotalListings / page_size),
            },
        };
    }

    // Get listings with recent views and sort by view count in Prisma
    const trendingListings = await prisma.listing.findMany({
        where: whereCondition,
        include: {
            listing_views: {
                where: {
                    viewed_at: {
                        gte: since,
                    },
                },
                select: {
                    id: true,
                    count: true,
                },
                orderBy: {
                    count: 'desc',
                },
                take: 1,
            },
            broker: {
                select: {
                    id: true,
                    name: true,
                    profile_pic: true,
                    country_code: true,
                    w_number: true,
                    company: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: [
            {
                listing_views: {
                    _count: 'desc',
                },
            },
            {
                created_at: 'desc',
            },
        ],
        take: maxTotalListings,
    });

    logger.info(`Featured listings fetched: ${trendingListings.length}`);

    // Apply pagination to the sorted results
    const paginatedListings = trendingListings.slice(skip, skip + take);

    const pagination = {
        page,
        page_size,
        total: maxTotalListings,
        totalPages: Math.ceil(maxTotalListings / page_size),
    };

    const formattedListings = paginatedListings.map((listing) => {
        const recentViews = listing.listing_views?.[0]?.count || 0;
        const { broker, ...rest } = listing;
        return {
            listing: {
                ...rest,
                recent_views: recentViews,
            },
            broker: {
                id: broker.id,
                name: broker.name,
                profile_pic: broker.profile_pic,
                country_code: broker.country_code,
                w_number: broker.w_number,
            },
            company: {
                name: broker.company?.name || '',
            },
        };
    });

    return {
        listings: formattedListings,
        pagination,
    };
};

export const getRecentListingsService = async () => {
    const listings = await prisma.listing.findMany({
        where: {
            admin_status: Admin_Status.Approved,
            image_urls: {
                isEmpty: false,
            },
        },
        orderBy: {
            created_at: 'desc',
        },
        take: 5,
        include: {
            broker: {
                select: {
                    id: true,
                    name: true,
                    profile_pic: true,
                    country_code: true,
                    w_number: true,
                    company: {
                        select: {
                            name: true,
                        },
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
        const { broker, ...listingWithoutBroker } = listing;
        const recentViews = listing.listing_views?.[0]?.count || 0;

        return {
            listing: listingWithoutBroker,
            recentViews,
            broker: {
                id: broker.id,
                name: broker.name,
                profile_pic: broker.profile_pic,
                country_code: broker.country_code,
                w_number: broker.w_number,
            },
            company: {
                name: broker.company?.name || '',
            },
        };
    });

    return {
        listings: formattedListings,
    };
};

/* Bulk insert listings */
export const bulkInsertListingsService = async (listings: Listing[]) => {
    try {
        const enrichedListings = [];

        for (const listing of listings) {
            let enrichedListing = {
                ...listing,
                admin_status: Admin_Status.Pending,
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

export const editListingService = async (
    listingId: string,
    updates: Partial<Listing>
) => {
    try {
        const existing = await prisma.listing.findUnique({
            where: { id: listingId },
        });
        if (!existing) throw new Error('Listing not found');

        const updatedListing = await prisma.listing.update({
            where: { id: listingId },
            data: {
                ...updates,
                // admin_status: Admin_Status.Pending, // Optional: reset status after edit - removing this for testing in dev server
            },
        });

        return updatedListing;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

/*Delete Listing by Id */
export const deleteListingbyId = async (listingId: string) => {
    try {
        const deletedListing = await prisma.listing.delete({
            where: {
                id: listingId,
            },
        });

        return deletedListing;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

/* Report Listing */
export const reportListingService = async (
    listingId: string,
    reason: string,
    description: string,
    brokerId: string
) => {
    try {
        const reportedListing = await prisma.listing.update({
            where: { id: listingId },
            data: {
                admin_status: Admin_Status.Reported,
            },
        });

        /* Create reported listing */
        await prisma.reportedListing.create({
            data: {
                listing_id: listingId,
                reported_by_id: brokerId,
                reason: reason,
                description: description,
            },
        });

        /* Create notification for broker of the listing */
        const broker = await prisma.broker.findUnique({
            where: { id: reportedListing.broker_id },
        });

        if (broker) {
            await prisma.notification.create({
                data: {
                    broker_id: broker.id,
                    type: NotificationType.General,
                    sent_by_id: '', // kept empty as it is a system generated notification
                    text: `Your listing has been reported for violating our community guidelines and is currently under review.`,
                    message: '', // kept empty as it is a system generated notification
                    listing_id: listingId,
                },
            });
        }

        return reportedListing;
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

// Generate Listing from Text Service
export const generateListingFromTextService = async (text: string) => {
    try {
        return await generateListingFromText(text);
    } catch (error) {
        logger.error(error);
        throw error;
    }
};

// Fetch popular localities service

export const getTopLocalitiesWithCounts = async () => {
    const result = await prisma.listing.groupBy({
        by: ['locality'],
        _count: {
            locality: true,
        },
        orderBy: {
            _count: {
                locality: 'desc',
            },
        },
        where: {
            locality: {
                not: null,
            },
            admin_status: Admin_Status.Approved,
        },
        take: 7, // get top 7 localities
    });

    const response = result.map((item) => ({
        locality: item.locality ?? 'Unknown',
        count: item._count?.locality ?? 0,
    }));

    return response;
};

// Get listing appreciation service
export const getListingAppreciationProjections = async (
    listingId: string
): Promise<PropertyDataPoint[]> => {
    // Fetch listing
    const listing = await prisma.listing.findFirst({
        where: {
            id: listingId,
            deal_type: DealType.Selling,
            category: {
                in: [Category.Ready_to_move, Category.Off_plan],
            },
            looking_for: false,
        },
    });

    if (!listing) {
        throw new Error('Listing not found');
    }

    if (!listing.locality || !listing.type || !listing.max_price) {
        if (!listing.locality) {
            throw new Error('Listing locality not found');
        }

        if (!listing.type) {
            throw new Error('Listing type not found');
        }

        if (!listing.max_price) {
            throw new Error('Listing price not found');
        }
    }

    if (listing.max_price < 100_000) {
        throw new Error('Listing price is too low, should be at least 100,000');
    }

    const propertyData = getPropertyData(
        propertiesData,
        listing.locality,
        listing.type
    );

    return propertyData;
};

export const getListingROIReportService = async (
    listingId: string,
    {
        num_of_years,
        is_self_use,
        is_self_paid,
    }: {
        num_of_years: number;
        is_self_use: boolean;
        is_self_paid: boolean;
    }
): Promise<{
    capital_gains: {
        today: number;
        preference_year: number;
    };
    expected_rental: {
        short_term: number;
        long_term: number;
    };
    break_even_year: number;
    avg_roi_per_year: number;
    cumulative_profit: number;
    roi_graph: { year: number; roi: number }[];
    goals: { year: number; goal: string; roi: number }[];
    area_appreciation_graph: {
        year: number;
        appreciation_perc: number;
    }[];
    rental_demand: number;
    what_if_presets: {
        conservative: {
            monthly_rent: number;
            interest_rate: number;
            down_payment: number;
        };
        balanced: {
            monthly_rent: number;
            interest_rate: number;
            down_payment: number;
        };
        aggressive: {
            monthly_rent: number;
            interest_rate: number;
            down_payment: number;
        };
    };
}> => {
    const listing = await prisma.listing.findFirst({
        where: {
            id: listingId,
            deal_type: DealType.Selling,
            category: {
                in: [Category.Ready_to_move, Category.Off_plan],
            },
            looking_for: false,
        },
    });

    if (!listing) {
        throw new Error('Listing not found');
    }

    if (
        !listing.locality ||
        !listing.type ||
        !listing.sq_ft ||
        !listing.max_price
    ) {
        if (!listing.locality) {
            throw new Error('Listing locality not found');
        }

        if (!listing.type) {
            throw new Error(
                'Listing type not found, should be either Apartment or Villa'
            );
        }

        if (!listing.sq_ft) {
            throw new Error('Listing size not found');
        }

        if (!listing.max_price) {
            throw new Error('Listing price not found');
        }
    }

    if (listing.max_price < 100_000) {
        throw new Error('Listing price is too low, should be at least 100,000');
    }

    const propertyData = getPropertyData(
        propertiesData,
        listing.locality,
        listing.type
    );

    const { futureValue } = calculateCapitalGains(
        propertyData,
        num_of_years,
        listing.max_price
    );

    const expectedRental = calculateExpectedRental(
        propertyData,
        num_of_years,
        listing.sq_ft,
        'monthly'
    );

    const breakEvenYear = calculateBreakEvenPeriodByType(
        propertyData,
        listing.max_price,
        listing.sq_ft,
        is_self_use,
        is_self_paid
    );

    const cumulativeROI = calculateCumulativeROIByType(
        propertyData,
        num_of_years,
        listing.max_price,
        listing.sq_ft,
        is_self_use,
        is_self_paid
    );
    const avgRoiPerYear = cumulativeROI ? cumulativeROI / num_of_years : 0;

    const cumulativeProfitsPerYear = calculateCumulativeProfitPerYearByType(
        propertyData,
        listing.max_price,
        listing.sq_ft,
        is_self_use,
        is_self_paid
    );

    // Only sum up to 5th year (index 4) since ROI graph shows data for 5 years
    const cumulativeProfit = cumulativeProfitsPerYear
        .slice(0, 5)
        .reduce((acc, curr) => acc + curr, 0);

    const roiGraph = calculateRoiDataPointsByType(
        propertyData,
        listing.max_price,
        listing.sq_ft,
        is_self_use,
        is_self_paid
    );

    const goals = getInvestmentGoalsWithROI(
        propertyData,
        is_self_use,
        is_self_paid,
        listing.max_price,
        listing.sq_ft
    );

    const areaAppreciationGraph = calculateAppreciationDataPoints(
        propertyData,
        num_of_years
    );

    const rentalDemandIncrease = calculateRentalDemandIncrease(
        propertyData,
        num_of_years,
        listing.sq_ft
    );

    const currentRentalPrice = getCurrentRentalPrice(
        propertyData,
        listing.sq_ft
    );

    return {
        capital_gains: {
            today: Math.round(listing.max_price),
            preference_year: Math.round(futureValue),
        },
        expected_rental: {
            short_term: Math.round(expectedRental.today),
            long_term: Math.round(expectedRental.long_term),
        },
        break_even_year: breakEvenYear,
        avg_roi_per_year: Math.round(avgRoiPerYear * 100) / 100, // Round to 2 decimal places
        cumulative_profit: Math.round(cumulativeProfit / 5), // Divide by 5 since we're only considering 5 years
        roi_graph: roiGraph.map((item) => ({
            year: item.year,
            roi: Math.round(item.roi),
        })),
        goals: goals.map((goal) => ({
            year: goal.year,
            goal: goal.goal,
            roi: Math.round(goal.roi),
        })),
        area_appreciation_graph: areaAppreciationGraph.map((item) => ({
            year: item.year,
            appreciation_perc: Math.round(item.appreciation_perc * 100) / 100, // Round to 2 decimal places
        })),
        rental_demand: Math.round(rentalDemandIncrease),
        what_if_presets: {
            conservative: {
                monthly_rent: Math.round(
                    currentRentalPrice - currentRentalPrice * 0.2
                ),
                interest_rate: 3.99,
                down_payment: 40,
            },
            balanced: {
                monthly_rent: Math.round(currentRentalPrice),
                interest_rate: 3.99,
                down_payment: 40,
            },
            aggressive: {
                monthly_rent: Math.round(
                    currentRentalPrice + currentRentalPrice * 0.2
                ),
                interest_rate: 3.99,
                down_payment: 40,
            },
        },
    };
};

export const getAIReportService = async (listingId: string): Promise<any> => {
    const listing = await prisma.listing.findFirst({
        where: {
            id: listingId,
            deal_type: DealType.Selling,
            category: {
                in: [Category.Ready_to_move, Category.Off_plan],
            },
            looking_for: false,
        },
        include: {
            broker: {
                select: {
                    id: true,
                    name: true,
                    profile_pic: true,
                    country_code: true,
                    w_number: true,
                    email: true,
                    linkedin_link: true,
                    ig_link: true,
                    user_id: true,
                    company: {
                        select: {
                            name: true,
                        },
                    },
                    specialities: true,
                    y_o_e: true,
                    designation: true,
                },
            },
        },
    });

    if (!listing) {
        throw new Error('Listing not found');
    }

    if (
        !listing.locality ||
        !listing.type ||
        !listing.max_price ||
        !listing.sq_ft
    ) {
        if (!listing.locality) {
            throw new Error('Listing locality not found');
        }

        if (!listing.type) {
            throw new Error('Listing type not found');
        }

        if (!listing.max_price) {
            throw new Error('Listing price not found');
        }

        if (!listing.sq_ft) {
            throw new Error('Listing size not found');
        }
    }

    if (listing.max_price < 100_000) {
        throw new Error('Listing price is too low, should be at least 100,000');
    }

    const propertyData = getPropertyData(
        propertiesData,
        listing.locality,
        listing.type
    );

    const roiIn5Years = calculatePropertyROI(
        propertyData,
        5,
        listing.max_price,
        listing.sq_ft
    );

    const breakEvenYear = calculateBreakEvenPeriod(
        propertyData,
        listing.max_price,
        listing.sq_ft
    );

    const increaseInRentalPrice = (year: number) => {
        if (year === 0) {
            return 0;
        }

        const rentalInXYears = getRentalPriceInYear(
            propertyData,
            listing.sq_ft!,
            year,
            'monthly'
        );

        const rentalPriceToday = getRentalPriceInYear(
            propertyData,
            listing.sq_ft!,
            0,
            'monthly'
        );

        return Math.round(
            ((rentalInXYears - rentalPriceToday) / rentalPriceToday) * 100
        );
    };

    return {
        listing: {
            title: listing.title,
            images: listing.image_urls,
            price: Math.round(listing.max_price),
            locality: listing.locality,
            num_of_bedrooms: listing.no_of_bedrooms,
            num_of_bathrooms: listing.no_of_bathrooms,
            sq_ft: Math.round(listing.sq_ft),
            purchase_price: Math.round(listing.max_price),
            appreciation: Math.round(
                getListingAppreciationInYear(propertyData, listing.max_price, 5)
            ),
            roi_percentage: Math.round(roiIn5Years),
            break_even_year: breakEvenYear,
        },
        growth_graph: [
            {
                year: 1,
                appreciation: Math.round(
                    getListingAppreciationInYear(
                        propertyData,
                        listing.max_price,
                        1
                    )
                ),
            },
            {
                year: 4,
                appreciation: Math.round(
                    getListingAppreciationInYear(
                        propertyData,
                        listing.max_price,
                        4
                    )
                ),
            },
            {
                year: 7,
                appreciation: Math.round(
                    getListingAppreciationInYear(
                        propertyData,
                        listing.max_price,
                        7
                    )
                ),
            },
        ],
        rental_graph: [
            {
                year: 1,
                rental: increaseInRentalPrice(1),
            },
            {
                year: 4,
                rental: increaseInRentalPrice(4),
            },
            {
                year: 7,
                rental: increaseInRentalPrice(7),
            },
        ],
        growth_projection: {
            appreciation: Math.round(propertyData[6].appreciation_perc),
            rental: increaseInRentalPrice(7),
        },
        rent: {
            current: Math.round(
                getRentalPriceInYear(propertyData, listing.sq_ft!, 0, 'monthly')
            ),
            projected: Math.round(
                getRentalPriceInYear(propertyData, listing.sq_ft!, 5, 'monthly')
            ),
        },
        nearby: await getNearbySummary({
            lat: listing.latitude!,
            lng: listing.longitude!,
        }),
        amenities: listing.amenities,
        broker: {
            id: listing.broker.id,
            name: listing.broker.name,
            designation: listing.broker.designation,
            y_o_e: listing.broker.y_o_e,
            specialities: listing.broker.specialities,
            company: listing.broker.company?.name,
            profile_pic: listing.broker.profile_pic,
            country_code: listing.broker.country_code,
            w_number: listing.broker.w_number,
            email: listing.broker.email,
            linkedin_link: listing.broker.linkedin_link,
            ig_link: listing.broker.ig_link,
        },
    };
};

type LatLng = { lat: number; lng: number };

type NearbyCategories = 'metro' | 'grocery' | 'school' | 'restaurant';

const CATEGORY_TYPES: Record<NearbyCategories, string> = {
    metro: 'subway_station', // metro = subway station
    grocery: 'supermarket', // grocery/supermarket
    school: 'school',
    restaurant: 'restaurant',
};

function haversineDistance(a: LatLng, b: LatLng): number {
    const R = 6371000; // meters
    const toRad = (x: number) => (x * Math.PI) / 180;

    const dLat = toRad(b.lat - a.lat);
    const dLon = toRad(b.lng - a.lng);

    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(h)); // meters
}

/**
 * Fetch nearest metro, grocery, school, restaurant
 * Returns distance in "Xm walk" format
 */
export async function getNearbySummary(center: LatLng) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error('Missing GOOGLE_MAPS_API_KEY');

    const nearby: Record<NearbyCategories, string> = {
        metro: 'N/A',
        grocery: 'N/A',
        school: 'N/A',
        restaurant: 'N/A',
    };

    for (const [cat, type] of Object.entries(CATEGORY_TYPES) as [
        NearbyCategories,
        string,
    ][]) {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${center.lat},${center.lng}&radius=1500&type=${type}&key=${apiKey}`;

        const res = await fetch(url);
        const data = (await res.json()) as {
            results: { geometry: { location: { lat: number; lng: number } } }[];
        };

        if (data.results?.length > 0) {
            const loc = data.results[0].geometry.location;
            const distMeters = haversineDistance(center, {
                lat: loc.lat,
                lng: loc.lng,
            });

            // Approx walking distance (round to nearest 50m)
            const rounded = Math.round(distMeters / 50) * 50;
            nearby[cat] = `${rounded}m walk`;
        }
    }

    return nearby;
}
