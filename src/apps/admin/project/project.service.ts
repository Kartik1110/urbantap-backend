import prisma from '@/utils/prisma';
import { AdminUserType, Prisma } from '@prisma/client';
import { PermissionChecker } from '@/utils/permissions';
import { geocodeAddress } from '@/utils/geocoding';
import logger from '@/utils/logger';
import { Express } from 'express';
import { uploadToS3 } from '@/utils/s3Upload';
import { uploadToS3Chunked, shouldUseChunkedUpload } from '@/utils/s3ChunkedUpload';

interface FloorPlanData {
    title: string;
    min_price?: number;
    max_price?: number;
    unit_size?: number;
    bedrooms: string;
    bathrooms: string;
    image_urls: string[];
}

interface ProjectCreateData
    extends Omit<Prisma.ProjectCreateInput, 'floor_plans' | 'inventory'> {
    floor_plans?: FloorPlanData[];
    inventory_files?: string[];
    company_id: string;
}

// Helper function to upload files with chunking support
async function uploadFileWithChunking(
    file: Express.Multer.File,
    fileName: string
): Promise<string> {
    const fileSize = file.size;
    const useChunking = shouldUseChunkedUpload(fileSize);
    
    logger.info(`📤 Processing file upload: ${file.originalname}`);
    logger.info(`📏 File details - Size: ${(fileSize / (1024 * 1024)).toFixed(2)}MB, Type: ${file.mimetype}`);
    
    if (useChunking) {
        logger.info(`🔧 Using chunked upload for file: ${file.originalname} (${(fileSize / (1024 * 1024)).toFixed(2)}MB)`);
        return await uploadToS3Chunked(file.path, fileName);
    } else {
        logger.info(`⚡ Using regular upload for file: ${file.originalname} (${(fileSize / (1024 * 1024)).toFixed(2)}MB)`);
        return await uploadToS3(file.path, fileName);
    }
}

// Service function to process and upload files
export async function processProjectFiles(files: Express.Multer.File[] | undefined) {
    const organizedFiles: { [key: string]: Express.Multer.File[] } = {};
    
    if (files && Array.isArray(files)) {
        files.forEach((file) => {
            if (!organizedFiles[file.fieldname]) {
                organizedFiles[file.fieldname] = [];
            }
            organizedFiles[file.fieldname].push(file);
        });
    }

    const result: {
        imageUrls: string[];
        brochureUrl?: string;
        inventoryFiles: string[];
        floorPlanImages: { [index: number]: string };
    } = {
        imageUrls: [],
        inventoryFiles: [],
        floorPlanImages: {},
    };

    // Upload project images
    if (organizedFiles.image_urls) {
        for (const file of organizedFiles.image_urls) {
            const ext = file.originalname.split('.').pop();
            const url = await uploadFileWithChunking(
                file,
                `projects/images/${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`
            );
            result.imageUrls.push(url);
        }
    }

    // Upload project brochure
    if (organizedFiles.file_url?.[0]) {
        const ext = organizedFiles.file_url[0].originalname.split('.').pop();
        result.brochureUrl = await uploadFileWithChunking(
            organizedFiles.file_url[0],
            `projects/brochures/${Date.now()}_brochure.${ext}`
        );
    }

    // Upload inventory file
    if (organizedFiles.inventory_file?.[0]) {
        const ext = organizedFiles.inventory_file[0].originalname.split('.').pop();
        const url = await uploadFileWithChunking(
            organizedFiles.inventory_file[0],
            `projects/inventory/${Date.now()}_inventory.${ext}`
        );
        result.inventoryFiles.push(url);
    }

    // Upload floor plan images dynamically
    for (const fieldName in organizedFiles) {
        if (fieldName.startsWith('floor_plan_image_')) {
            const index = parseInt(fieldName.replace('floor_plan_image_', ''));
            if (!isNaN(index) && organizedFiles[fieldName][0]) {
                const file = organizedFiles[fieldName][0];
                const ext = file.originalname.split('.').pop();
                const url = await uploadFileWithChunking(
                    file,
                    `projects/floor_plans/${Date.now()}_floor_plan_${index}.${ext}`
                );
                result.floorPlanImages[index] = url;
            }
        }
    }

    return result;
}

export const createProjectService = async (data: ProjectCreateData) => {
    const { floor_plans, inventory_files, company_id, ...projectData } = data;

    const admin_user = await prisma.adminUser.findFirst({
        where: {
            type: AdminUserType.MEMBER,
            company_id: company_id,
        },
        select: {
            id: true,
        },
        orderBy: {
            created_at: 'desc',
        },
    });

    if (!admin_user) {
        logger.error('Admin Member not found for this broker.');
    }

    // Calculate max_sq_ft from the largest unit_size in floor_plans
    let calculatedMaxSqFt: number | undefined;
    if (floor_plans && floor_plans.length > 0) {
        const unitSizes = floor_plans
            .map((fp) => fp.unit_size)
            .filter(
                (size): size is number => size !== undefined && size !== null
            );

        if (unitSizes.length > 0) {
            calculatedMaxSqFt = Math.max(...unitSizes);
        }
    }

    // Add locality information if address is provided
    let enrichedProjectData = { ...projectData };
    if (projectData.address) {
        const rawAddress = `${projectData.address}, ${projectData.city}`;
        const geocodeResult = await geocodeAddress(rawAddress);

        if (geocodeResult) {
            enrichedProjectData = {
                ...enrichedProjectData,
                address: geocodeResult.formatted_address,
                locality: geocodeResult.locality,
                latitude: geocodeResult.lat,
                longitude: geocodeResult.lng,
            };
            logger.info(
                `✅ Geocoded project with address: ${projectData.address}`
            );
        } else {
            logger.warn(
                `⚠️ Unable to geocode project address: ${projectData.address}`
            );
        }
    }

    const project = await prisma.project.create({
        data: {
            ...enrichedProjectData,
            max_sq_ft: calculatedMaxSqFt,
            min_bedrooms: projectData.min_bedrooms,
            max_bedrooms: projectData.max_bedrooms,
            ...(admin_user && {
                admin_user: {
                    connect: {
                        id: admin_user.id,
                    },
                },
            }),
            floor_plans: floor_plans
                ? {
                      create: floor_plans.map((fp) => ({
                          title: fp.title,
                          min_price: fp.min_price,
                          max_price: fp.max_price,
                          unit_size: fp.unit_size,
                          bedrooms:
                              fp.bedrooms as Prisma.FloorPlanCreateInput['bedrooms'],
                          bathrooms:
                              fp.bathrooms as Prisma.FloorPlanCreateInput['bathrooms'],
                          image_urls: fp.image_urls,
                      })),
                  }
                : undefined,
            inventory: inventory_files
                ? {
                      create: inventory_files.map((file_url) => ({
                          file_url,
                      })),
                  }
                : undefined,
        },
        include: {
            floor_plans: true,
            inventory: true,
            admin_user: {
                include: { broker: true },
            },
            developer: {
                select: {
                    id: true,
                    company: {
                        select: {
                            name: true,
                            logo: true,
                        },
                    },
                },
            },
        },
    });

    return project;
};

export const getProjectsService = async (developerId: string) => {
    return await prisma.project.findMany({
        where: { developer_id: developerId },
        include: {
            floor_plans: true,
            inventory: true,
            admin_user: {
                include: { broker: true },
            },
            developer: {
                select: {
                    id: true,
                    company: {
                        select: {
                            name: true,
                            logo: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            created_at: 'desc',
        },
    });
};

export const updateProjectService = async (
    projectId: string,
    data: ProjectCreateData
) => {
    const { floor_plans, inventory_files, ...projectData } = data;

    // Calculate max_sq_ft from the largest unit_size in floor_plans
    let calculatedMaxSqFt: number | undefined;
    if (floor_plans && floor_plans.length > 0) {
        const unitSizes = floor_plans
            .map((fp) => fp.unit_size)
            .filter(
                (size): size is number => size !== undefined && size !== null
            );

        if (unitSizes.length > 0) {
            calculatedMaxSqFt = Math.max(...unitSizes);
        }
    }

    // Add locality information if address is provided and being updated
    let enrichedProjectData = { ...projectData };
    if (projectData.address) {
        const rawAddress = `${projectData.address}, ${projectData.city}`;
        const geocodeResult = await geocodeAddress(rawAddress);

        if (geocodeResult) {
            enrichedProjectData = {
                ...enrichedProjectData,
                address: geocodeResult.formatted_address,
                locality: geocodeResult.locality,
                latitude: geocodeResult.lat,
                longitude: geocodeResult.lng,
            };
            logger.info(
                `✅ Geocoded project update with address: ${projectData.address}`
            );
        } else {
            logger.warn(
                `⚠️ Unable to geocode project address during update: ${projectData.address}`
            );
        }
    }

    // Delete existing floor plans if updating (floor plans are replaced)
    await prisma.floorPlan.deleteMany({
        where: { project_id: projectId },
    });

    // For inventory: ADD new files instead of replacing existing ones
    // Only add new inventory files if provided
    if (inventory_files && inventory_files.length > 0) {
        await prisma.inventory.createMany({
            data: inventory_files.map((file_url: string) => ({
                file_url,
                project_id: projectId,
            })),
        });
    }

    const project = await prisma.project.update({
        where: { id: projectId },
        data: {
            ...enrichedProjectData,
            max_sq_ft: calculatedMaxSqFt,
            min_bedrooms: projectData.min_bedrooms,
            max_bedrooms: projectData.max_bedrooms,
            floor_plans:
                floor_plans && floor_plans.length > 0
                    ? {
                          create: floor_plans.map((fp: FloorPlanData) => ({
                              title: fp.title,
                              min_price: fp.min_price,
                              max_price: fp.max_price,
                              unit_size: fp.unit_size,
                              bedrooms:
                                  fp.bedrooms as Prisma.FloorPlanCreateInput['bedrooms'],
                              bathrooms:
                                  fp.bathrooms as Prisma.FloorPlanCreateInput['bathrooms'],
                              image_urls: fp.image_urls,
                          })),
                      }
                    : undefined,
        },
        include: {
            floor_plans: true,
            inventory: true,
            admin_user: {
                include: { broker: true },
            },
            developer: {
                select: {
                    id: true,
                    company: {
                        select: {
                            name: true,
                            logo: true,
                        },
                    },
                },
            },
        },
    });

    return project;
};

export const deleteProjectService = async (
    projectId: string,
    developerId: string
) => {
    // First check if the project belongs to the developer
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            developer_id: developerId,
        },
    });

    if (!project) {
        return null;
    }

    // Delete related records first (cascading delete)
    await prisma.floorPlan.deleteMany({
        where: { project_id: projectId },
    });

    await prisma.inventory.deleteMany({
        where: { project_id: projectId },
    });

    // Delete the project
    const deletedProject = await prisma.project.delete({
        where: { id: projectId },
    });

    return deletedProject;
};

/**
 * Get projects with RBAC filtering
 */
export const getProjectsWithRBACService = async (adminUserId: string) => {
    return await PermissionChecker.getAccessibleProjects(adminUserId);
};

/**
 * Get project by ID with RBAC validation
 */
export const getProjectByIdWithRBACService = async (
    adminUserId: string,
    projectId: string
) => {
    const canView = await PermissionChecker.canViewProject(
        adminUserId,
        projectId
    );

    if (!canView) {
        throw new Error('Access denied: Cannot view this project');
    }

    return await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            floor_plans: true,
            inventory: true,
            admin_user: {
                include: { broker: true },
            },
            developer: {
                select: {
                    id: true,
                    company: {
                        select: {
                            name: true,
                            logo: true,
                        },
                    },
                },
            },
        },
    });
};
