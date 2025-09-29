import prisma from '@/utils/prisma';
import { Prisma, City, Category } from '@prisma/client';
import {
    calculateAppreciationDataPoints,
    calculateAverageRentPerYearAfterHandover,
    calculateAverageROIAfterHandover,
    calculateBreakEvenAfterHandover,
    calculateHandoverPrice,
    calculatePriceAfterHandover,
    calculateRoiDataPointsByTypeAfterHandover,
    calculateShortTermRental,
    getPropertyData,
    getRentalPriceInYear,
    MergedPropertyData,
} from '@/utils/roiReport';
import logger from '@/utils/logger';

declare const fetch: typeof globalThis.fetch;

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

// Approved amenities list - only these will be returned in responses
const APPROVED_AMENITIES = [
    'Pets_Allowed',
    'Swimming_Pool',
    'Gym',
    'Parking',
    'Security',
    'Balcony',
    'Garden',
    'Air_Conditioning',
    'Furnished',
    'Heating',
    'Jaccuzi',
];

// Function to filter amenities to only include approved ones and format specific ones
const filterApprovedAmenities = (amenities: string[]): string[] => {
    return amenities
        .filter((amenity) => APPROVED_AMENITIES.includes(amenity))
        .map((amenity) => {
            // Format specific amenities to replace underscores with spaces
            switch (amenity) {
                case 'Swimming_Pool':
                    return 'Swimming Pool';
                case 'Pets_Allowed':
                    return 'Pets Allowed';
                case 'Air_Conditioning':
                    return 'Air Conditioning';
                default:
                    return amenity;
            }
        });
};

export const getProjectsService = async ({
    page,
    pageSize,
    title,
    location,
    type,
    developer,
    search,
}: {
    page: number;
    pageSize: number;
    title?: string;
    location?: string;
    type?: string;
    developer?: string;
    search?: string;
}) => {
    const skip = (page - 1) * pageSize;

    const whereClause: Prisma.ProjectWhereInput = {
        ...(title && {
            title: {
                contains: title,
                mode: 'insensitive' as Prisma.QueryMode,
            },
        }),
        ...(location && {
            city: location as City,
        }),
        ...(type && {
            category: type as Category,
        }),
        ...(developer && {
            developer: {
                company: {
                    name: {
                        contains: developer,
                        mode: 'insensitive' as Prisma.QueryMode,
                    },
                },
            },
        }),
        ...(search && {
            OR: [
                {
                    project_name: {
                        contains: search,
                        mode: 'insensitive' as Prisma.QueryMode,
                    },
                },
                {
                    developer: {
                        company: {
                            name: {
                                contains: search,
                                mode: 'insensitive' as Prisma.QueryMode,
                            },
                        },
                    },
                },
            ],
        }),
    };

    const [projectsRaw, totalCount] = await Promise.all([
        prisma.project.findMany({
            where: whereClause,
            skip,
            take: pageSize,
            include: {
                developer: {
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
                    },
                },
            },
        }),
        prisma.project.count({ where: whereClause }),
    ]);

    const projects = projectsRaw.map((proj) => ({
        id: proj.id,
        category: proj.category,
        image: proj.image_urls.length > 0 ? proj.image_urls[0] : null, // Only first image
        project_name: proj.project_name,
        address: proj.address,
        views: proj.views,
        brochure_url: proj.brochure_url,
    }));

    const pagination = {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
    };

    return { projects, pagination };
};

export const getProjectByIdService = async (id: string) => {
    // First check if project exists
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            developer: true,
            floor_plans: true,
        },
    });

    if (!project) {
        return null;
    }

    // Increment the views count only if project exists
    await prisma.project.update({
        where: { id },
        data: {
            views: {
                increment: 1,
            },
        },
    });

    // Parse and structure payment_plan2 data as list of objects
    const parsePaymentPlan = (paymentPlanString: string | null) => {
        if (!paymentPlanString) return [];

        try {
            const parsed = JSON.parse(paymentPlanString);
            const paymentStages = [
                { stage: 'one', label: 'Booking', percentage: parsed.one },
                {
                    stage: 'two',
                    label: 'During Construction',
                    percentage: parsed.two,
                },
                {
                    stage: 'three',
                    label: 'On Completion',
                    percentage: parsed.three,
                },
                { stage: 'four', label: 'Handover', percentage: parsed.four },
            ];

            // Filter out stages with 0% and return as list of objects
            return paymentStages
                .filter((stage) => stage.percentage > 0)
                .map((stage) => ({
                    stage: stage.stage,
                    label: stage.label,
                    percentage: parseInt(stage.percentage.toString()),
                }));
        } catch (error) {
            console.error('Error parsing payment_plan2:', error);
            return [];
        }
    };

    // Process and format unit_types data with properties count and floor plan details
    const processUnitTypes = (floorPlans: any[]) => {
        if (!floorPlans || !Array.isArray(floorPlans)) return [];

        // Count floor plans by bedroom type
        const unitTypeGroups: { [key: string]: any[] } = {};

        floorPlans.forEach((floorPlan) => {
            if (floorPlan.bedrooms) {
                const bedroomType = floorPlan.bedrooms;
                if (!unitTypeGroups[bedroomType]) {
                    unitTypeGroups[bedroomType] = [];
                }
                unitTypeGroups[bedroomType].push(floorPlan);
            }
        });

        // Map bedroom types to display names for unit_types name field
        const nameMapping: { [key: string]: string } = {
            Studio: 'Studio',
            One: '1BHK',
            Two: '2BHK',
            Three: '3BHK',
            Four: '4BHK',
            Five: '5BHK',
            Six: '6BHK',
            Seven: '7BHK',
            Four_Plus: '4+BHK',
        };

        // Map bedroom types to numeric values for floor-plans bedrooms field
        const bedroomMapping: { [key: string]: string } = {
            Studio: 'Studio',
            One: '1',
            Two: '2',
            Three: '3',
            Four: '4',
            Five: '5',
            Six: '6',
            Seven: '7',
            Four_Plus: '4+',
        };

        // Convert to array of objects with name, properties_count, and floor-plans
        const unitTypes = Object.entries(unitTypeGroups)
            .map(([bedroomType, floorPlansForType]) => ({
                name: nameMapping[bedroomType] || bedroomType,
                properties_count: floorPlansForType.length,
                floor_plans: floorPlansForType.map((floorPlan) => ({
                    id: floorPlan.id,
                    min_price: floorPlan.min_price,
                    bedrooms:
                        bedroomMapping[floorPlan.bedrooms] ||
                        floorPlan.bedrooms,
                    unit_size: floorPlan.unit_size,
                })),
            }))
            .sort((a, b) => {
                // Custom sorting: Studio first, then by number, then others
                if (a.name === 'Studio') return -1;
                if (b.name === 'Studio') return 1;

                const aNum = parseInt(a.name.match(/\d+/)?.[0] || '999');
                const bNum = parseInt(b.name.match(/\d+/)?.[0] || '999');

                if (aNum !== 999 && bNum !== 999) return aNum - bNum;
                if (aNum !== 999) return -1;
                if (bNum !== 999) return 1;

                return a.name.localeCompare(b.name);
            });

        return unitTypes;
    };

    // Get the latest inventory (most recent by created_at) for the project
    const latestInventory = await prisma.inventory.findFirst({
        where: {
            project_id: project.id,
        },
        orderBy: {
            created_at: 'desc',
        },
        select: {
            file_url: true,
        },
    });

    return {
        id: project.id,
        project_name: project.project_name,
        description: project.description,
        image_urls: project.image_urls,
        currency: project.currency,
        min_price: project.min_price,
        max_price: project.max_price,
        address: project.address,
        city: project.city,
        brochure_url: project.brochure_url,
        inventory_url: latestInventory?.file_url || null,
        category: project.category,
        project_age: project.project_age,
        furnished: project.furnished,
        max_sq_ft: project.max_sq_ft,
        payment_structure: parsePaymentPlan(project.payment_structure),
        unit_types: processUnitTypes(project.floor_plans),
        locality: project.locality,
        latitude: project.latitude,
        longitude: project.longitude,
        amenities: filterApprovedAmenities(project.amenities),
        views: project.views,
        floor_plans: project.floor_plans.flatMap(
            (floorPlan) => floorPlan.image_urls || []
        ),
    };
};

export const getProjectByNameService = async (name: string) => {
    // First check if project exists by name
    const project = await prisma.project.findFirst({
        where: {
            project_name: {
                equals: name,
                mode: 'insensitive',
            },
        },
        include: {
            developer: true,
            floor_plans: true,
        },
    });

    if (!project) {
        throw new Error('Project not found');
    }

    // Increment the views count only if project exists
    await prisma.project.update({
        where: { id: project.id },
        data: {
            views: {
                increment: 1,
            },
        },
    });

    // Parse and structure payment_plan2 data as list of objects
    const parsePaymentPlan = (paymentPlanString: string | null) => {
        if (!paymentPlanString) return [];

        try {
            const parsed = JSON.parse(paymentPlanString);
            const paymentStages = [
                { stage: 'one', label: 'Booking', percentage: parsed.one },
                {
                    stage: 'two',
                    label: 'During Construction',
                    percentage: parsed.two,
                },
                {
                    stage: 'three',
                    label: 'On Completion',
                    percentage: parsed.three,
                },
                { stage: 'four', label: 'Handover', percentage: parsed.four },
            ];

            // Filter out stages with 0% and return as list of objects
            return paymentStages
                .filter((stage) => stage.percentage > 0)
                .map((stage) => ({
                    stage: stage.stage,
                    label: stage.label,
                    percentage: parseInt(stage.percentage.toString()),
                }));
        } catch (error) {
            console.error('Error parsing payment_plan2:', error);
            return [];
        }
    };

    // Process and format unit_types data with properties count and floor plan details
    const processUnitTypes = (floorPlans: any[]) => {
        if (!floorPlans || !Array.isArray(floorPlans)) return [];

        // Count floor plans by bedroom type
        const unitTypeGroups: { [key: string]: any[] } = {};

        floorPlans.forEach((floorPlan) => {
            if (floorPlan.bedrooms) {
                const bedroomType = floorPlan.bedrooms;
                if (!unitTypeGroups[bedroomType]) {
                    unitTypeGroups[bedroomType] = [];
                }
                unitTypeGroups[bedroomType].push(floorPlan);
            }
        });

        // Map bedroom types to display names for unit_types name field
        const nameMapping: { [key: string]: string } = {
            Studio: 'Studio',
            One: '1BHK',
            Two: '2BHK',
            Three: '3BHK',
            Four: '4BHK',
            Five: '5BHK',
            Six: '6BHK',
            Seven: '7BHK',
            Four_Plus: '4+BHK',
        };

        // Map bedroom types to numeric values for floor-plans bedrooms field
        const bedroomMapping: { [key: string]: string } = {
            Studio: 'Studio',
            One: '1',
            Two: '2',
            Three: '3',
            Four: '4',
            Five: '5',
            Six: '6',
            Seven: '7',
            Four_Plus: '4+',
        };

        // Convert to array of objects with name, properties_count, and floor-plans
        const unitTypes = Object.entries(unitTypeGroups)
            .map(([bedroomType, floorPlansForType]) => ({
                name: nameMapping[bedroomType] || bedroomType,
                properties_count: floorPlansForType.length,
                floor_plans: floorPlansForType.map((floorPlan) => ({
                    id: floorPlan.id,
                    min_price: floorPlan.min_price,
                    bedrooms:
                        bedroomMapping[floorPlan.bedrooms] ||
                        floorPlan.bedrooms,
                    unit_size: floorPlan.unit_size,
                })),
            }))
            .sort((a, b) => {
                // Custom sorting: Studio first, then by number, then others
                if (a.name === 'Studio') return -1;
                if (b.name === 'Studio') return 1;

                const aNum = parseInt(a.name.match(/\d+/)?.[0] || '999');
                const bNum = parseInt(b.name.match(/\d+/)?.[0] || '999');

                if (aNum !== 999 && bNum !== 999) return aNum - bNum;
                if (aNum !== 999) return -1;
                if (bNum !== 999) return 1;

                return a.name.localeCompare(b.name);
            });

        return unitTypes;
    };

    // Get the latest inventory (most recent by created_at) for the project
    const latestInventory = await prisma.inventory.findFirst({
        where: {
            project_id: project.id,
        },
        orderBy: {
            created_at: 'desc',
        },
        select: {
            file_url: true,
        },
    });

    return {
        id: project.id,
        project_name: project.project_name,
        description: project.description,
        image_urls: project.image_urls,
        currency: project.currency,
        min_price: project.min_price,
        max_price: project.max_price,
        address: project.address,
        city: project.city,
        brochure_url: project.brochure_url,
        inventory_url: latestInventory?.file_url || null,
        category: project.category,
        project_age: project.project_age,
        furnished: project.furnished,
        max_sq_ft: project.max_sq_ft,
        payment_structure: parsePaymentPlan(project.payment_structure),
        unit_types: processUnitTypes(project.floor_plans),
        locality: project.locality,
        latitude: project.latitude,
        longitude: project.longitude,
        amenities: filterApprovedAmenities(project.amenities),
        views: project.views,
        floor_plans: project.floor_plans.flatMap(
            (floorPlan) => floorPlan.image_urls || []
        ),
    };
};

export const createProjectService = async (data: any) => {
    return await prisma.project.create({
        data,
    });
};

export const getProjectFloorPlansService = async (
    projectId: string,
    bhk?: string
) => {
    // Map BHK query parameter to Bedrooms enum values
    // This matches the format used in unit_types from project details API
    const mapBhkToBedrooms = (bhk: string): string | undefined => {
        const bhkMapping: { [key: string]: string } = {
            Studio: 'Studio',
            '1BHK': 'One',
            '2BHK': 'Two',
            '3BHK': 'Three',
            '4BHK': 'Four',
            '4+BHK': 'Four_Plus',
            '5BHK': 'Five',
            '6BHK': 'Six',
            '7BHK': 'Seven',
        };
        return bhkMapping[bhk];
    };

    const whereClause: any = {
        project_id: projectId,
    };

    // Add BHK filtering if provided
    if (bhk) {
        const bedroomFilter = mapBhkToBedrooms(bhk);
        if (bedroomFilter) {
            whereClause.bedrooms = bedroomFilter;
        }
    }
    const nameMapping: { [key: string]: string } = {
        Studio: 'Studio',
        One: '1BHK',
        Two: '2BHK',
        Three: '3BHK',
        Four: '4BHK',
        Five: '5BHK',
        Six: '6BHK',
        Seven: '7BHK',
    };

    const floorPlans = await prisma.floorPlan.findMany({
        where: whereClause,
        select: {
            id: true,
            title: true,
            image_urls: true,
            min_price: true,
            max_price: true,
            unit_size: true,
            bedrooms: true,
            bathrooms: true,
        },
        orderBy: {
            title: 'asc',
        },
    });

    // Transform the floorPlans to include BHK format in title
    const transformedFloorPlans = floorPlans.map((floorPlan) => ({
        ...floorPlan,
        title: floorPlan.bedrooms
            ? nameMapping[floorPlan.bedrooms] || floorPlan.title
            : floorPlan.title,
    }));

    // Sort floor plans: Studio first, then by number (1BHK, 2BHK, etc.)
    const sortedFloorPlans = transformedFloorPlans.sort((a, b) => {
        // Handle null titles
        const aTitle = a.title || '';
        const bTitle = b.title || '';

        // Studio comes first
        if (aTitle === 'Studio') return -1;
        if (bTitle === 'Studio') return 1;

        // Extract numbers from titles for comparison
        const aNum = parseInt(aTitle.match(/\d+/)?.[0] || '999');
        const bNum = parseInt(bTitle.match(/\d+/)?.[0] || '999');

        // Sort by number
        if (aNum !== 999 && bNum !== 999) return aNum - bNum;
        if (aNum !== 999) return -1;
        if (bNum !== 999) return 1;

        // Fallback to alphabetical
        return aTitle.localeCompare(bTitle);
    });

    return sortedFloorPlans;
};

export const getProjectsByDeveloperService = async (
    developerId: string,
    {
        page,
        pageSize,
        search,
    }: { page: number; pageSize: number; search?: string }
) => {
    const skip = (page - 1) * pageSize;

    // First check if developer exists
    const developer = await prisma.developer.findUnique({
        where: { id: developerId },
        select: { id: true },
    });

    if (!developer) {
        throw new Error('Developer not found');
    }

    const whereClause: Prisma.ProjectWhereInput = {
        developer_id: developerId,
        ...(search && {
            project_name: {
                contains: search,
                mode: 'insensitive' as Prisma.QueryMode,
            },
        }),
    };

    const [projectsRaw, totalCount] = await Promise.all([
        prisma.project.findMany({
            where: whereClause,
            select: {
                id: true,
                category: true,
                image_urls: true,
                project_name: true,
                address: true,
            },
            skip,
            take: pageSize,
            orderBy: {
                created_at: 'desc',
            },
        }),
        prisma.project.count({
            where: whereClause,
        }),
    ]);

    // Format projects to match the required structure
    const projects = projectsRaw.map((project) => ({
        id: project.id,
        category: project.category,
        image: project.image_urls.length > 0 ? project.image_urls[0] : null, // Only first image
        project_name: project.project_name,
        address: project.address,
    }));

    const pagination = {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
    };

    return { projects, pagination };
};

export const getFeaturedProjectsService = async ({
    page,
    pageSize,
}: {
    page: number;
    pageSize: number;
}) => {
    const skip = (page - 1) * pageSize;

    const whereClause = {
        views: {
            gte: 1, // Only projects with at least 1 view
        },
    };

    const [projectsRaw, totalCount] = await Promise.all([
        prisma.project.findMany({
            where: whereClause,
            skip,
            take: pageSize,
            orderBy: {
                views: 'desc', // Most viewed first
            },
            include: {
                developer: {
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
                    },
                },
            },
        }),
        prisma.project.count({ where: whereClause }),
    ]);

    const projects = projectsRaw.map((proj) => ({
        id: proj.id,
        category: proj.category,
        image: proj.image_urls.length > 0 ? proj.image_urls[0] : null, // Only first image
        project_name: proj.project_name,
        address: proj.address,
        views: proj.views,
        company_name: proj.developer?.company?.name || null,
        min_price: proj.min_price,
    }));

    const pagination = {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
    };

    return { projects, pagination };
};

export const generateProjectROIReportService = async (
    projectId: string,
    floorPlanId: string
): Promise<{
    capital_gains: {
        today: number;
        handover: {
            year: string;
            value: number;
        };
        future: {
            year: string;
            value: number;
        };
    };
    expected_rental: {
        short_term: number;
        short_term_percentage: number;
        long_term: number;
        long_term_percentage: number;
    };
    break_even_year: {
        short_term: number;
        long_term: number;
    };
    avg_roi_percentage_per_year: number;
    avg_rent_per_year: number;
    roi_graph: { year: string; roi: number }[];
    growth_table: {
        year: string;
        max_price: number;
        short_term_rental: number;
        long_term_rental: number;
    }[];
    avg_area_appreciation_per_year: number;
    area_appreciation_graph: { year: string; roi: number }[];
    rental_yield: { year: number; percentage: number };
}> => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new Error('Project not found');
    }

    const floorPlans = await prisma.floorPlan.findMany({
        where: {
            project_id: projectId,
        },
    });

    let floorPlan;
    if (floorPlanId) {
        floorPlan = floorPlans.find((plan) => plan.id === floorPlanId);
    } else {
        const minSizeFloorPlans = floorPlans
            .filter((plan) => plan.bedrooms === project.min_bedrooms)
            .sort((a, b) => (a.unit_size || 0) - (b.unit_size || 0));

        floorPlan = minSizeFloorPlans[0];

        logger.warn(
            'Floor plan Id not provided, falling back to smallest unit available - ' +
                `bedrooms: ${floorPlan.bedrooms} and unit_size: ${floorPlan.unit_size}`
        );
    }

    if (!floorPlan) {
        throw new Error('Floor plan not found');
    }

    const min_price = floorPlanId
        ? floorPlan.min_price || project.min_price
        : project.min_price;

    const { locality, handover_year } = project;
    const { unit_size } = floorPlan;

    if (!min_price || !handover_year || !locality || !unit_size) {
        if (!min_price) {
            throw new Error('Price not found');
        }

        if (!handover_year) {
            throw new Error('Handover year not found');
        }

        if (!locality) {
            throw new Error('Locality not found');
        }

        if (!unit_size) {
            throw new Error('Unit size not found');
        }
    }

    const listingType = 'Apartment'; // TODO: figure this out
    const propertyData = getPropertyData(propertiesData, locality, listingType);

    const handoverYear = handover_year;
    const currentYear = new Date().getFullYear();
    const yearDiff = handoverYear - currentYear;

    const listingPriceAtHandover = calculateHandoverPrice(
        min_price,
        handoverYear
    );
    const listingPriceAtHandoverPlus5 = calculatePriceAfterHandover(
        propertyData,
        listingPriceAtHandover,
        handoverYear,
        5
    );

    const shortTermRoiMultiplier = 1.6;
    const longTermRent = getRentalPriceInYear(
        propertyData,
        unit_size,
        yearDiff
    );
    const longTermAppreciation = (longTermRent / min_price) * 100;

    const { rent: shortTermRent, roi: shortTermAppreciation } =
        calculateShortTermRental(
            min_price,
            longTermRent,
            shortTermRoiMultiplier
        );

    const longTermRentAtHandoverPlus5 = getRentalPriceInYear(
        propertyData,
        unit_size,
        yearDiff + 5
    );
    const { rent: shortTermRentAtHandoverPlus5 } = calculateShortTermRental(
        min_price,
        longTermRentAtHandoverPlus5,
        shortTermRoiMultiplier
    );

    const shortTermBreakEvenYear = calculateBreakEvenAfterHandover(
        propertyData,
        min_price,
        unit_size,
        handoverYear,
        shortTermRoiMultiplier
    );

    const longTermBreakEvenYear = calculateBreakEvenAfterHandover(
        propertyData,
        min_price,
        unit_size,
        handoverYear
    );

    const avgRoiPerYear = calculateAverageROIAfterHandover(
        propertyData,
        handoverYear,
        5,
        min_price,
        unit_size,
        shortTermRoiMultiplier
    );

    const avgRentPerYear = calculateAverageRentPerYearAfterHandover(
        propertyData,
        min_price,
        handoverYear,
        5,
        unit_size,
        shortTermRoiMultiplier
    );

    const roiGraphPoints = calculateRoiDataPointsByTypeAfterHandover(
        propertyData,
        min_price,
        unit_size,
        handoverYear,
        6,
        shortTermRoiMultiplier
    );

    const roiGraph = [
        roiGraphPoints[0],
        roiGraphPoints[3],
        roiGraphPoints[5],
    ].map((item) => ({
        year: item.year,
        roi: Math.round(item.roi),
    }));

    const areaAppreciationGraphAll =
        calculateAppreciationDataPoints(propertyData);

    const areaAppreciationGraph = areaAppreciationGraphAll.map((item) => ({
        year: item.year,
        roi: Math.round(item.appreciation_perc),
    }));

    const avgAreaAppreciationPerYear =
        areaAppreciationGraphAll[4].appreciation_perc / 5;

    const increaseInRentalPrice = (year: number) => {
        if (year === 0) {
            return 0;
        }

        const rentalInXYears = getRentalPriceInYear(
            propertyData,
            unit_size,
            yearDiff + year
        );

        return ((rentalInXYears - longTermRent) / longTermRent) * 100;
    };

    return {
        capital_gains: {
            today: Math.round(min_price),
            handover: {
                value: Math.round(listingPriceAtHandover),
                year: String(handoverYear),
            },
            future: {
                value: Math.round(listingPriceAtHandoverPlus5),
                year: String(handoverYear + 5),
            },
        },
        expected_rental: {
            short_term: Math.round(shortTermRent),
            short_term_percentage:
                Math.round(shortTermAppreciation * 100) / 100, // Round to 2 decimal places
            long_term: Math.round(longTermRent),
            long_term_percentage: Math.round(longTermAppreciation * 100) / 100, // Round to 2 decimal places
        },
        break_even_year: {
            short_term: shortTermBreakEvenYear,
            long_term: longTermBreakEvenYear,
        },
        avg_roi_percentage_per_year: Math.round(avgRoiPerYear * 100) / 100, // Round to 2 decimal places
        avg_rent_per_year: Math.round(avgRentPerYear),
        roi_graph: roiGraph,
        growth_table: [
            {
                year: String(currentYear),
                max_price: Math.round(min_price),
                short_term_rental: 0,
                long_term_rental: 0,
            },
            {
                year: String(handoverYear),
                max_price: Math.round(listingPriceAtHandover),
                short_term_rental: Math.round(shortTermRent),
                long_term_rental: Math.round(longTermRent),
            },
            {
                year: String(handoverYear + 5),
                max_price: Math.round(listingPriceAtHandoverPlus5),
                short_term_rental: Math.round(shortTermRentAtHandoverPlus5),
                long_term_rental: Math.round(longTermRentAtHandoverPlus5),
            },
        ],
        avg_area_appreciation_per_year:
            Math.round(avgAreaAppreciationPerYear * 100) / 100,
        area_appreciation_graph: areaAppreciationGraph,
        rental_yield: {
            year: 5,
            percentage: Math.round(increaseInRentalPrice(5) * 100) / 100,
        },
    };
};

export const getProjectAIReportService = async (
    projectId: string,
    floorPlanId: string,
    userId: string,
    brokerId?: string
): Promise<any> => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            developer: {
                include: { company: true },
            },
        },
    });

    if (!project) {
        throw new Error('Project not found');
    }

    const floorPlans = await prisma.floorPlan.findMany({
        where: {
            project_id: projectId,
        },
    });

    let floorPlan;
    if (floorPlanId) {
        floorPlan = floorPlans.find((plan) => plan.id === floorPlanId);
    } else {
        const minSizeFloorPlans = floorPlans
            .filter((plan) => plan.bedrooms === project.min_bedrooms)
            .sort((a, b) => (a.unit_size || 0) - (b.unit_size || 0));

        floorPlan = minSizeFloorPlans[0];

        logger.warn(
            'Floor plan Id not provided, falling back to smallest unit available - ' +
                `bedrooms: ${floorPlan.bedrooms} and unit_size: ${floorPlan.unit_size}`
        );
    }

    if (!floorPlan) {
        throw new Error('Floor plan not found');
    }

    const min_price = floorPlanId
        ? floorPlan.min_price || project.min_price
        : project.min_price;

    const { locality, handover_year } = project;
    const { unit_size } = floorPlan;

    if (!min_price || !handover_year || !locality || !unit_size) {
        if (!min_price) {
            throw new Error('Price not found');
        }

        if (!handover_year) {
            throw new Error('Handover year not found');
        }

        if (!locality) {
            throw new Error('Locality not found');
        }

        if (!unit_size) {
            throw new Error('Unit size not found');
        }
    }

    let broker;

    if (brokerId) {
        broker = await prisma.broker.findUnique({
            where: { id: brokerId },
            include: { company: { select: { name: true } } },
        });
    } else {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                brokers: { include: { company: { select: { name: true } } } },
            },
        });

        broker = user?.brokers[0];
    }

    const listingType = 'Apartment'; // TODO: figure this out
    const propertyData = getPropertyData(propertiesData, locality, listingType);

    const handoverYear = handover_year;
    const currentYear = new Date().getFullYear();
    const yearDiff = handoverYear - currentYear;

    const listingPriceAtHandover = calculateHandoverPrice(
        min_price,
        handoverYear
    );
    const listingPriceAtHandoverPlus5 = calculatePriceAfterHandover(
        propertyData,
        listingPriceAtHandover,
        handoverYear,
        5
    );

    const increaseInRentalPriceAfterHandOver = (year: number) => {
        if (year === 0) {
            return 0;
        }

        const rentalInXYears = getRentalPriceInYear(
            propertyData,
            unit_size,
            yearDiff + year
        );

        const percInc = ((rentalInXYears - longTermRent) / longTermRent) * 100;

        return Math.round(percInc * 100) / 100; // Rounding till 2 decimals
    };

    const shortTermRoiMultiplier = 1.6;
    const longTermRent = getRentalPriceInYear(
        propertyData,
        unit_size,
        yearDiff
    );
    const { rent: shortTermRent } = calculateShortTermRental(
        min_price,
        longTermRent,
        shortTermRoiMultiplier
    );

    const avgYearlyRental = (longTermRent + shortTermRent) / 2;
    const roiAtHandoverYear = (avgYearlyRental / min_price) * 100;

    // Parse and structure payment_plan2 data as list of objects
    const parsePaymentPlan = (paymentPlanString: string | null) => {
        if (!paymentPlanString) return [];

        try {
            const parsed = JSON.parse(paymentPlanString);
            const paymentStages = [
                { stage: 'one', label: 'Booking', percentage: parsed.one },
                {
                    stage: 'two',
                    label: 'During Construction',
                    percentage: parsed.two,
                },
                {
                    stage: 'three',
                    label: 'On Completion',
                    percentage: parsed.three,
                },
                { stage: 'four', label: 'Handover', percentage: parsed.four },
            ];

            // Filter out stages with 0% and return as list of objects
            return paymentStages
                .filter((stage) => stage.percentage > 0)
                .map((stage) => ({
                    stage: stage.stage,
                    label: stage.label,
                    percentage: parseInt(stage.percentage.toString()),
                }));
        } catch (error) {
            console.error('Error parsing payment_plan2:', error);
            return [];
        }
    };

    return {
        project: {
            title: project.title,
            images: project.image_urls,
            price: Math.round(min_price),
            description: project.description,
            locality: locality,
            price_after_handover: Math.round(listingPriceAtHandover),
            yearly_rental: Math.round(avgYearlyRental),
            roi_percentage: Math.round(roiAtHandoverYear * 100) / 100,
            payment_structure: parsePaymentPlan(project.payment_structure),
            latitude: project.latitude,
            longitude: project.longitude,
        },
        growth_graph: [
            {
                year: String(currentYear),
                appreciation: Math.round(min_price),
            },
            {
                year: String(handoverYear),
                appreciation: Math.round(listingPriceAtHandover),
            },
            {
                year: String(handoverYear + 2),
                appreciation: Math.round(
                    calculatePriceAfterHandover(
                        propertyData,
                        listingPriceAtHandover,
                        handoverYear,
                        2
                    )
                ),
            },
        ],
        rental_graph: [
            {
                year: String(handoverYear),
                rental: increaseInRentalPriceAfterHandOver(1),
            },
            {
                year: String(handoverYear + 2),
                rental: increaseInRentalPriceAfterHandOver(3),
            },
            {
                year: String(handoverYear + 4),
                rental: increaseInRentalPriceAfterHandOver(5),
            },
        ],
        growth_projection: {
            appreciation: Math.round(
                ((listingPriceAtHandoverPlus5 - listingPriceAtHandover) /
                    listingPriceAtHandover) *
                    100
            ),
            rental: increaseInRentalPriceAfterHandOver(5),
        },
        rent: {
            short_term: Math.round(shortTermRent),
            long_term: Math.round(longTermRent),
        },
        developer: {
            name: project.developer.company?.name,
            logo_url: project.developer.company?.logo,
            floor_plan_image_urls: floorPlanId
                ? floorPlan.image_urls
                : floorPlans.flatMap((plan) => plan.image_urls),
        },
        nearby: await getNearbySummary({
            lat: project.latitude!,
            lng: project.longitude!,
        }),
        amenities: filterApprovedAmenities(project.amenities || []),
        broker: {
            id: broker?.id,
            name: broker?.name,
            designation: broker?.designation,
            y_o_e: broker?.y_o_e,
            specialities: broker?.specialities,
            company: broker?.company,
            profile_pic: broker?.profile_pic,
            country_code: broker?.country_code,
            w_number: broker?.w_number,
            email: broker?.email,
            linkedin_link: broker?.linkedin_link,
            ig_link: broker?.ig_link,
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
