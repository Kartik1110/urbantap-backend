import { Broker, User, DealType, Category } from '@prisma/client';
import prisma from '../utils/prisma';
import logger from '../utils/logger';

interface DashboardStats {
    profile_completion_percentage: number;
    jobs_count: number;
    projects_count: number;
    rental_listings_count: number;
    selling_listings_count: number;
}

export const getDashboardStatsService = async (
    userId: string
): Promise<DashboardStats> => {
    try {
        // Get user with broker data
        const user = await prisma.user.findFirst({
            where: { id: userId },
            include: {
                brokers: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Calculate profile completion percentage
        const profileCompletionPercentage =
            await calculateProfileCompletionPercentage(user);

        let rentalListingsCount = 0;
        let sellingListingsCount = 0;
        let jobsCount = 0;

        const broker = user.brokers?.[0];

        if (broker) {

            const allListings = await prisma.listing.findMany({
                where: {
                    broker_id: broker.id,
                },
                select: {
                    id: true,
                    deal_type: true,
                    title: true,
                },
            });


            rentalListingsCount = await prisma.listing.count({
                where: {
                    broker_id: broker.id,
                    OR: [
                        { deal_type: DealType.Rental },
                        { deal_type: null, category: Category.Rent } // Fallback for older listings
                    ],
                },
            });

            sellingListingsCount = await prisma.listing.count({
                where: {
                    broker_id: broker.id,
                    OR: [
                        { deal_type: DealType.Selling },
                        { deal_type: null, category: { in: [Category.Ready_to_move, Category.Off_plan] } } // Fallback for older listings
                    ],
                },
            });


        } else {
            console.log('No broker found for user:', userId);
        }

        jobsCount = await prisma.job.count({
            where: {
                userId: userId,
            },
        });

        const projectsCount = 0;

        return {
            profile_completion_percentage: profileCompletionPercentage,
            jobs_count: jobsCount,
            projects_count: projectsCount,
            rental_listings_count: rentalListingsCount,
            selling_listings_count: sellingListingsCount,
        };
    } catch (error) {
        logger.error(error);
        throw new Error(
            `Failed to fetch dashboard stats: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};

const calculateProfileCompletionPercentage = async (
    user: User
): Promise<number> => {
    const brokerFields = [
        'name',
        'email',
        'info',
        'y_o_e',
        'languages',
        'profile_pic',
        'w_number',
        'designation',
        'company_id',
        'linkedin_url',
        'ig_link',
    ];

    let totalFields = 0;
    let filledFields = 0;

    const broker = await prisma.broker.findUnique({
        where: {
            user_id: user.id,
            email: user.email,
        },
    });

    // Check broker fields if user has broker profile
    if (broker) {
        brokerFields.forEach((field) => {
            totalFields++;
            if (field === 'languages') {
                if (
                    broker[field] &&
                    Array.isArray(broker[field]) &&
                    broker[field].length > 0
                ) {
                    filledFields++;
                }
            } else if (field === 'is_certified') {
                if (broker[field] !== null && broker[field] !== undefined) {
                    filledFields++;
                }
            } else if (field === 'y_o_e') {
                if (broker[field] && broker[field] > 0) {
                    filledFields++;
                }
            } else {
                if (
                    broker[field as keyof Broker] &&
                    broker[field as keyof Broker] !== ''
                ) {
                    filledFields++;
                }
            }
        });
    }

    // Calculate percentage
    const percentage =
        totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
    return percentage;
};
