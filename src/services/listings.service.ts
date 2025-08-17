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
} from '@prisma/client';
import generateListingFromText from '../scripts/generate-listings';
import { Prisma } from '@prisma/client';
import { geocodeAddress } from '../utils/geocoding';

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
                            { admin_status: { not: Admin_Status.Approved } }
                        ]
                    }
                ]
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
                    ? [{ deal_type: { in: deal_type } }]
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

export const getFeaturedListingsService = async (page: number = 1, page_size: number = 10) => {
    const now = new Date();
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000);

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

    // Get total count of listings with views in the last 48 hours (limited to 30)
    const totalCount = await prisma.listing.count({
        where: {
            admin_status: Admin_Status.Approved,
            listing_views: {
                some: {
                    viewed_at: {
                        gte: since,
                    },
                },
            },
        },
        take: 30, // Limit total count to 30 listings
    });

    // Ensure we don't exceed 30 total listings
    const maxTotalListings = Math.min(totalCount, 30);
    
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

    // Single optimized DB call with proper ordering and pagination
    const trendingListings = await prisma.listing.findMany({
        where: {
            admin_status: Admin_Status.Approved,
            listing_views: {
                some: {
                    viewed_at: {
                        gte: since,
                    },
                },
            },
        },
        skip,
        take,
        orderBy: {
            created_at: 'desc', // Fallback ordering since Prisma doesn't support _max on relations
        },
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
    });

    const pagination = {
        page,
        page_size,
        total: maxTotalListings,
        totalPages: Math.ceil(maxTotalListings / page_size),
    };

    const formattedListings = trendingListings.map((listing) => {
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
