import prisma from '@/utils/prisma';
import { AdminUserType, Prisma, Currency } from '@prisma/client';
import { PermissionChecker } from '@/utils/permissions';
import { geocodeAddress } from '@/utils/geocoding';
import logger from '@/utils/logger';
import { Express } from 'express';
import { AuthenticatedRequest } from '@/utils/verifyToken';
import { uploadToS3 } from '@/utils/s3Upload';
import fs from 'fs';
import path from 'path';

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

interface ProcessedFiles {
    imageUrls: string[];
    brochureUrl?: string;
    inventoryFiles: string[];
    floorPlanImages: { [index: number]: string };
    assembledFilePaths: string[];
    multerTempFilePaths: string[];
}

// Helper function to find and create file from chunk
async function findAndCreateFileFromChunk(
    assembledDir: string,
    chunkId: string,
    fieldName: string
): Promise<Express.Multer.File | null> {
    try {
        const existingFiles = fs.readdirSync(assembledDir).filter(f => f.startsWith(chunkId));
        
        if (existingFiles.length === 0) {
            return null;
        }

        const assembledPath = path.join(assembledDir, existingFiles[0]);
        const assembledBuffer = fs.readFileSync(assembledPath);
        const stats = fs.statSync(assembledPath);
        
        // Extract original filename
        const parts = existingFiles[0].split('_');
        const originalName = parts.slice(1).join('_'); // Remove chunkId prefix
        
        // Determine mime type
        const ext = originalName.split('.').pop()?.toLowerCase();
        const mimeType = ext === 'pdf' ? 'application/pdf' : 
                        ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                        ext === 'png' ? 'image/png' : 'application/octet-stream';

        const assembledFile: Express.Multer.File = {
            fieldname: fieldName,
            originalname: originalName,
            encoding: '7bit',
            mimetype: mimeType,
            buffer: assembledBuffer,
            size: stats.size,
            destination: '',
            filename: '',
            path: assembledPath,
            stream: fs.createReadStream(assembledPath),
        };

        return assembledFile;
    } catch (error) {
        logger.error(`Error retrieving assembled file for chunk ID ${chunkId}:`, error);
        return null;
    }
}

// Helper function to retrieve assembled chunked files
export async function retrieveAssembledChunkedFiles(
    files: Express.Multer.File[] | undefined,
    req: AuthenticatedRequest
): Promise<Express.Multer.File[] | undefined> {
    const assembledDir = path.join(process.cwd(), 'uploads', 'assembled');
    
    if (!fs.existsSync(assembledDir)) {
        return files;
    }

    const resultFiles = files ? [...files] : [];

    // Check for brochure chunk fileId
    const brochureChunkId = req.body.file_url_chunk_id;
    
    if (brochureChunkId) {
        const brochureFile = await findAndCreateFileFromChunk(assembledDir, brochureChunkId, 'file_url');
        if (brochureFile) {
            resultFiles.push(brochureFile);
        }
    }

    // Check for inventory chunk fileId
    const inventoryChunkId = req.body.inventory_file_chunk_id;
    
    if (inventoryChunkId) {
        const inventoryFile = await findAndCreateFileFromChunk(assembledDir, inventoryChunkId, 'inventory_file');
        if (inventoryFile) {
            resultFiles.push(inventoryFile);
        }
    }

    return resultFiles.length > 0 ? resultFiles : undefined;
}

// Process project files and upload to S3
export async function processProjectFiles(
    files: Express.Multer.File[] | undefined
): Promise<ProcessedFiles> {
    const result: ProcessedFiles = {
        imageUrls: [],
        brochureUrl: undefined,
        inventoryFiles: [],
        floorPlanImages: {},
        assembledFilePaths: [],
        multerTempFilePaths: [],
    };

    if (!files || files.length === 0) {
        return result;
    }

    // Store assembled file paths for cleanup after S3 upload
    // Also track multer temp files (files NOT in assembled folder)
    files.forEach(file => {
        if (file.path && file.path.includes('assembled')) {
            result.assembledFilePaths.push(file.path);
        } else if (file.path && file.path.includes('uploads') && !file.path.includes('assembled') && !file.path.includes('chunks')) {
            // This is a multer temp file
            result.multerTempFilePaths.push(file.path);
        }
    });

    // Organize files by field name
    const organizedFiles: { [key: string]: Express.Multer.File[] } = {};
    files.forEach((file) => {
        if (!organizedFiles[file.fieldname]) {
            organizedFiles[file.fieldname] = [];
        }
        organizedFiles[file.fieldname].push(file);
    });

    // Upload project images
    if (organizedFiles.image_urls) {
        for (const file of organizedFiles.image_urls) {
            const ext = file.originalname.split('.').pop();
            const url = await uploadToS3(
                file.path,
                `projects/images/${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`
            );
            result.imageUrls.push(url);
        }
    }

    // Upload project brochure
    if (organizedFiles.file_url?.[0]) {
        const ext = organizedFiles.file_url[0].originalname.split('.').pop();
        result.brochureUrl = await uploadToS3(
            organizedFiles.file_url[0].path,
            `projects/brochures/${Date.now()}_brochure.${ext}`
        );
    }

    // Upload inventory file
    if (organizedFiles.inventory_file?.[0]) {
        const ext = organizedFiles.inventory_file[0].originalname.split('.').pop();
        const url = await uploadToS3(
            organizedFiles.inventory_file[0].path,
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
                const url = await uploadToS3(
                    file.path,
                    `projects/floor_plans/${Date.now()}_floor_plan_${index}.${ext}`
                );
                result.floorPlanImages[index] = url;
            }
        }
    }

    return result;
}

// Clean up temporary files (assembled files or multer temp files)
export function cleanupTemporaryFiles(filePaths: string[]): void {
    if (!filePaths || filePaths.length === 0) {
        return;
    }

    filePaths.forEach(filePath => {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                logger.info(`Cleaned up temp file: ${filePath}`);
            }
        } catch (e) {
            logger.error(`Error cleaning up temp file ${filePath}:`, e);
        }
    });
}

// Parse project body data
export function parseProjectBody(
    body: any,
    processedFiles: ProcessedFiles,
    user: AuthenticatedRequest['user']
): ProjectCreateData {
    const {
        title,
        description,
        min_price,
        currency,
        address,
        city,
        category,
        type,
        project_name,
        project_age,
        furnished,
        unit_types,
        amenities,
        handover_year,
        payment_structure,
        floor_plans,
        latitude,
        longitude,
        min_bedrooms,
        max_bedrooms,
    } = body;

    // Parse floor plans and add images
    let floorPlansData: FloorPlanData[] = [];
    if (floor_plans) {
        const parsedFloorPlans = JSON.parse(floor_plans);
        floorPlansData = parsedFloorPlans.map((fp: any, index: number) => ({
            title: fp.title,
            min_price: fp.min_price,
            max_price: fp.max_price,
            unit_size: fp.unit_size,
            bedrooms: fp.bedrooms,
            bathrooms: fp.bathrooms,
            image_urls: processedFiles.floorPlanImages[index]
                ? [processedFiles.floorPlanImages[index]]
                : [],
        }));
    }

    return {
        title,
        description,
        min_price: min_price ? parseFloat(min_price) : undefined,
        currency: currency || Currency.AED,
        address,
        city,
        category,
        type: JSON.parse(type), // expects JSON string array
        project_name,
        project_age,
        furnished,
        unit_types: JSON.parse(unit_types), // expects JSON string
        amenities: amenities ? JSON.parse(amenities) : [],
        handover_year: handover_year ? parseInt(handover_year) : undefined,
        payment_structure: payment_structure
            ? JSON.stringify(JSON.parse(payment_structure))
            : undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        min_bedrooms,
        max_bedrooms,
        image_urls: processedFiles.imageUrls,
        brochure_url: processedFiles.brochureUrl,
        floor_plans: floorPlansData,
        inventory_files: processedFiles.inventoryFiles,
        company_id: user?.companyId!,
        developer: {
            connect: {
                id: user?.entityId!,
            },
        },
    };
}

// Parse update project body data
export function parseUpdateProjectBody(
    body: any,
    processedFiles: ProcessedFiles,
    user: AuthenticatedRequest['user']
): any {
    const {
        title,
        description,
        min_price,
        currency,
        address,
        city,
        category,
        type,
        project_name,
        project_age,
        furnished,
        unit_types,
        amenities,
        handover_year,
        payment_structure,
        floor_plans,
        existing_image_urls,
        latitude,
        longitude,
        min_bedrooms,
        max_bedrooms,
    } = body;

    // Parse floor plans and add images
    let floorPlansData: FloorPlanData[] = [];
    if (floor_plans) {
        const parsedFloorPlans = JSON.parse(floor_plans);
        floorPlansData = parsedFloorPlans.map((fp: any, index: number) => ({
            title: fp.title,
            min_price: fp.min_price,
            max_price: fp.max_price,
            unit_size: fp.unit_size,
            bedrooms: fp.bedrooms,
            bathrooms: fp.bathrooms,
            image_urls: processedFiles.floorPlanImages[index]
                ? [processedFiles.floorPlanImages[index]]
                : fp.existing_image_urls || [],
        }));
    }

    // Combine existing images with new ones
    let finalImageUrls = processedFiles.imageUrls;
    if (existing_image_urls) {
        const existingUrls = JSON.parse(existing_image_urls);
        finalImageUrls = [...existingUrls, ...processedFiles.imageUrls];
    }

    const updateData: any = {
        ...(title && { title }),
        ...(description && { description }),
        ...(min_price && { min_price: parseFloat(min_price) }),
        ...(currency && { currency }),
        ...(address && { address }),
        ...(city && { city }),
        ...(category && { category }),
        ...(type && { type: JSON.parse(type) }),
        ...(project_name && { project_name }),
        ...(project_age && { project_age }),
        ...(furnished && { furnished }),
        ...(unit_types && { unit_types: JSON.parse(unit_types) }),
        ...(amenities && { amenities: JSON.parse(amenities) }),
        ...(handover_year && { handover_year: parseInt(handover_year) }),
        ...(payment_structure && {
            payment_structure: JSON.stringify(
                JSON.parse(payment_structure)
            ),
        }),
        ...(latitude && { latitude: parseFloat(latitude) }),
        ...(longitude && { longitude: parseFloat(longitude) }),
        ...(min_bedrooms && { min_bedrooms }),
        ...(max_bedrooms && { max_bedrooms }),
        ...(finalImageUrls.length > 0 && { image_urls: finalImageUrls }),
        ...(processedFiles.brochureUrl && { brochure_url: processedFiles.brochureUrl }),
        floor_plans: floorPlansData,
        inventory_files: processedFiles.inventoryFiles,
    };

    return updateData;
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
        const rawAddress = `${projectData.address}, Dubai`;
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
        const rawAddress = `${projectData.address}, Dubai`;
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
