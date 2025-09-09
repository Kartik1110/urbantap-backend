import prisma from '../utils/prisma';
import { Prisma, City, Category } from '@prisma/client';

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
            type: type as Category,
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
        type: proj.type,
        image: proj.image_urls.length > 0 ? proj.image_urls[0] : null, // Only first image
        project_name: proj.project_name,
        address: proj.address,
        views: proj.views,
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
            floor_plans: true
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
                increment: 1
            }
        }
    });

    // Parse and structure payment_plan2 data as list of objects
    const parsePaymentPlan = (paymentPlanString: string | null) => {
        if (!paymentPlanString) return [];
        
        try {
            const parsed = JSON.parse(paymentPlanString);
            const paymentStages = [
                { stage: 'one', label: 'Booking', percentage: parsed.one },
                { stage: 'two', label: 'During Construction', percentage: parsed.two },
                { stage: 'three', label: 'On Completion', percentage: parsed.three },
                { stage: 'four', label: 'Handover', percentage: parsed.four }
            ];
            
            // Filter out stages with 0% and return as list of objects
            return paymentStages
                .filter(stage => stage.percentage > 0)
                .map(stage => ({
                    stage: stage.stage,
                    label: stage.label,
                    percentage: parseInt(stage.percentage.toString())
                }));
        } catch (error) {
            console.error('Error parsing payment_plan2:', error);
            return [];
        }
    };

    // Process and format unit_types data with properties count and floor plan details
    const processUnitTypes = (floorPlans: any[]) => {
        if (!floorPlans || !Array.isArray(floorPlans)) return [];
        
        // Group floor plans by bedroom type
        const unitTypeGroups: { [key: string]: any[] } = {};
        
        floorPlans.forEach(floorPlan => {
            if (floorPlan.bedrooms) {
                const bedroomType = floorPlan.bedrooms;
                if (!unitTypeGroups[bedroomType]) {
                    unitTypeGroups[bedroomType] = [];
                }
                unitTypeGroups[bedroomType].push(floorPlan);
            }
        });
        
        // Map bedroom types to display names
        const typeMapping: { [key: string]: string } = {
            'Studio': 'Studio',
            'One': 'One',
            'Two': 'Two', 
            'Three': 'Three',
            'Four': 'Four',
            'Five': 'Five',
            'Six': 'Six',
            'Seven': 'Seven',
            'Four_Plus': 'Four_Plus'
        };
        
        // Convert to array of objects with name, properties_count, and floor-plans
        const unitTypes = Object.entries(unitTypeGroups)
            .map(([bedroomType, floorPlansForType]) => ({
                name: typeMapping[bedroomType] || bedroomType,
                properties_count: floorPlansForType.length,
                "floor-plans": floorPlansForType.map(floorPlan => ({
                    min_price: floorPlan.min_price,
                    bedrooms: floorPlan.bedrooms,
                    unit_size: floorPlan.unit_size
                }))
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
        file_url: project.file_url,
        type: project.type,
        project_age: project.project_age,
        furnished: project.furnished,
        max_sq_ft: project.max_sq_ft,
        payment_structure: parsePaymentPlan(project.payment_structure),
        unit_types: processUnitTypes(project.floor_plans),
        locality: project.locality,
        latitude: project.latitude,
        longitude: project.longitude,
        amenities: project.amenities,
        views: project.views,
        floor_plans: project.floor_plans.flatMap(floorPlan => floorPlan.image_urls || [])
    };
};

export const createProjectService = async (data: any) => {
    return await prisma.project.create({
        data,
    });
};

export const getProjectFloorPlansService = async (projectId: string, bhk?: string) => {
    // Map BHK query parameter to Bedrooms enum values
    // This matches the format used in unit_types from project details API
    const mapBhkToBedrooms = (bhk: string): string | undefined => {
        const bhkMapping: { [key: string]: string } = {
            'Studio': 'Studio',
            '1Bhk': 'One',
            '2Bhk': 'Two', 
            '3Bhk': 'Three',
            '4Bhk': 'Four',
            '4+Bhk': 'Four_Plus',
            '5Bhk': 'Five',
            '6Bhk': 'Six',
            '7Bhk': 'Seven'
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

    return floorPlans;
};

export const getProjectsByDeveloperService = async (developerId: string, { page, pageSize, search }: { page: number; pageSize: number; search?: string }) => {
    const skip = (page - 1) * pageSize;

    // First check if developer exists
    const developer = await prisma.developer.findUnique({
        where: { id: developerId },
        select: { id: true }
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
                type: true,
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
    const projects = projectsRaw.map(project => ({
        id: project.id,
        type: project.type,
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

export const getFeaturedProjectsService = async ({ page, pageSize }: { page: number; pageSize: number }) => {
    const skip = (page - 1) * pageSize;

    const whereClause = {
        views: {
            gte: 1  // Only projects with at least 1 view
        }
    };

    const [projectsRaw, totalCount] = await Promise.all([
        prisma.project.findMany({
            where: whereClause,
            skip,
            take: pageSize,
            orderBy: {
                views: 'desc'  // Most viewed first
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
        type: proj.type,
        image: proj.image_urls.length > 0 ? proj.image_urls[0] : null, // Only first image
        project_name: proj.project_name,
        address: proj.address,
        views: proj.views,
        company_name: proj.developer?.company?.name || null,
        max_price: proj.max_price,
    }));

    const pagination = {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
    };

    return { projects, pagination };
};
