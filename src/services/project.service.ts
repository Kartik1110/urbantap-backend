import prisma from '../utils/prisma';
import { Prisma, City, Category } from '@prisma/client';

export const getProjectsService = async ({
    page,
    pageSize,
    title,
    location,
    type,
    developer,
}: {
    page: number;
    pageSize: number;
    title?: string;
    location?: string;
    type?: string;
    developer?: string;
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
        image: proj.image,
        title: proj.title,
        description: proj.description,
        developer: proj.developer,
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

    // Process and format unit_types data
    const processUnitTypes = (unitTypes: any) => {
        if (!unitTypes || !Array.isArray(unitTypes)) return [];
        
        // Remove duplicates and convert to proper format
        const uniqueTypes = [...new Set(unitTypes)];
        
        const typeMapping: { [key: string]: string } = {
            'One': '1Bhk',
            'Two': '2Bhk', 
            'Three': '3Bhk',
            'Four': '4Bhk',
            'Five': '5Bhk',
            'Six': '6Bhk',
            'Studio': 'Studio',
            'Penthouse': 'Penthouse',
            'Villa': 'Villa',
            'Townhouse': 'Townhouse'
        };
        
        return uniqueTypes
            .map(type => typeMapping[type] || type)
            .sort((a, b) => {
                // Custom sorting: Studio first, then by number, then others
                if (a === 'Studio') return -1;
                if (b === 'Studio') return 1;
                
                const aNum = parseInt(a.match(/\d+/)?.[0] || '999');
                const bNum = parseInt(b.match(/\d+/)?.[0] || '999');
                
                if (aNum !== 999 && bNum !== 999) return aNum - bNum;
                if (aNum !== 999) return -1;
                if (bNum !== 999) return 1;
                
                return a.localeCompare(b);
            });
    };

    return {
        id: project.id,
        project_name: project.project_name,
        description: project.description,
        images: project.images,
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
        payment_plan2: parsePaymentPlan(project.payment_plan2),
        unit_types: processUnitTypes(project.unit_types),
        locality: project.locality,
        latitude: project.latitude,
        longitude: project.longitude,
        amenities: project.amenities,
        floor_plans: project.floor_plans
    };
};

export const createProjectService = async (data: any) => {
    return await prisma.project.create({
        data,
    });
};
