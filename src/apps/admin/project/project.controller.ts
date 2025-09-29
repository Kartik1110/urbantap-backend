import logger from '@/utils/logger';
import { Response, Express } from 'express';
import { uploadToS3 } from '@/utils/s3Upload';
import { Currency, CompanyType } from '@prisma/client';
import { AuthenticatedRequest } from '@/utils/verifyToken';
import {
    createProjectService,
    getProjectsService,
    updateProjectService,
    deleteProjectService,
} from './project.service';

export const createProject = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        if (!req.user?.entityId) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized: No developer linked.',
            });
        }

        const files = req.files as
            | { [fieldname: string]: Express.Multer.File[] }
            | undefined;

        // Upload project images
        let imageUrls: string[] = [];
        if (files?.image_urls) {
            for (const file of files.image_urls) {
                const ext = file.originalname.split('.').pop();
                const url = await uploadToS3(
                    file.path,
                    `projects/images/${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`
                );
                imageUrls.push(url);
            }
        }

        // Upload project brochure
        let brochureUrl: string | undefined;
        if (files?.file_url?.[0]) {
            const ext = files.file_url[0].originalname.split('.').pop();
            brochureUrl = await uploadToS3(
                files.file_url[0].path,
                `projects/brochures/${Date.now()}_brochure.${ext}`
            );
        }

        // Upload inventory file
        let inventoryFiles: string[] = [];
        if (files?.inventory_file?.[0]) {
            const ext = files.inventory_file[0].originalname.split('.').pop();
            const url = await uploadToS3(
                files.inventory_file[0].path,
                `projects/inventory/${Date.now()}_inventory.${ext}`
            );
            inventoryFiles.push(url);
        }

        // Upload floor plan images
        const floorPlanImages: { [index: number]: string } = {};
        for (let i = 0; i < 10; i++) {
            const fieldName = `floor_plan_image_${i}`;
            if (files?.[fieldName]?.[0]) {
                const file = files[fieldName][0];
                const ext = file.originalname.split('.').pop();
                const url = await uploadToS3(
                    file.path,
                    `projects/floor_plans/${Date.now()}_floor_plan_${i}.${ext}`
                );
                floorPlanImages[i] = url;
            }
        }

        // Parse body fields
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
        } = req.body;

        // Parse floor plans and add images
        let floorPlansData: any[] = [];
        if (floor_plans) {
            const parsedFloorPlans = JSON.parse(floor_plans);
            floorPlansData = parsedFloorPlans.map((fp: any, index: number) => ({
                title: fp.title,
                min_price: fp.min_price,
                max_price: fp.max_price,
                unit_size: fp.unit_size,
                bedrooms: fp.bedrooms,
                bathrooms: fp.bathrooms,
                image_urls: floorPlanImages[index]
                    ? [floorPlanImages[index]]
                    : [],
            }));
        }

        const projectData = {
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
            image_urls: imageUrls,
            brochure_url: brochureUrl,
            floor_plans: floorPlansData,
            inventory_files: inventoryFiles,
            developer: {
                connect: {
                    id: req.user.entityId,
                },
            },
        };

        const project = await createProjectService(projectData);

        res.json({
            status: 'success',
            message: 'Project created successfully',
            data: project,
        });
    } catch (error) {
        logger.error('Create project error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create project',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const getProjects = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const entityData = req.user?.entityId;
        const type = req.user?.type;

        if (!entityData || !type || type !== CompanyType.Developer) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized',
            });
        }

        const projects = await getProjectsService(entityData);

        res.status(200).json({
            status: 'success',
            message: 'Projects fetched successfully',
            data: projects,
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch projects',
            error: error.message || error,
        });
    }
};

export const updateProject = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (!req.user?.entityId) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized: No developer linked.',
            });
        }

        if (!id) {
            return res.status(400).json({
                status: 'error',
                message: 'Project ID is required.',
            });
        }

        const files = req.files as
            | { [fieldname: string]: Express.Multer.File[] }
            | undefined;

        // Upload new project images if provided
        let imageUrls: string[] = [];
        if (files?.image_urls) {
            for (const file of files.image_urls) {
                const ext = file.originalname.split('.').pop();
                const url = await uploadToS3(
                    file.path,
                    `projects/images/${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`
                );
                imageUrls.push(url);
            }
        }

        // Upload new project brochure if provided
        let brochureUrl: string | undefined;
        if (files?.file_url?.[0]) {
            const ext = files.file_url[0].originalname.split('.').pop();
            brochureUrl = await uploadToS3(
                files.file_url[0].path,
                `projects/brochures/${Date.now()}_brochure.${ext}`
            );
        }

        // Upload new inventory file if provided
        let inventoryFiles: string[] = [];
        if (files?.inventory_file?.[0]) {
            const ext = files.inventory_file[0].originalname.split('.').pop();
            const url = await uploadToS3(
                files.inventory_file[0].path,
                `projects/inventory/${Date.now()}_inventory.${ext}`
            );
            inventoryFiles.push(url);
        }

        // Upload new floor plan images if provided
        const floorPlanImages: { [index: number]: string } = {};
        for (let i = 0; i < 10; i++) {
            const fieldName = `floor_plan_image_${i}`;
            if (files?.[fieldName]?.[0]) {
                const file = files[fieldName][0];
                const ext = file.originalname.split('.').pop();
                const url = await uploadToS3(
                    file.path,
                    `projects/floor_plans/${Date.now()}_floor_plan_${i}.${ext}`
                );
                floorPlanImages[i] = url;
            }
        }

        // Parse body fields
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
        } = req.body;

        // Parse floor plans and add images
        let floorPlansData: any[] = [];
        if (floor_plans) {
            const parsedFloorPlans = JSON.parse(floor_plans);
            floorPlansData = parsedFloorPlans.map((fp: any, index: number) => ({
                title: fp.title,
                min_price: fp.min_price,
                max_price: fp.max_price,
                unit_size: fp.unit_size,
                bedrooms: fp.bedrooms,
                bathrooms: fp.bathrooms,
                image_urls: floorPlanImages[index]
                    ? [floorPlanImages[index]]
                    : fp.existing_image_urls || [],
            }));
        }

        // Combine existing images with new ones
        let finalImageUrls = imageUrls;
        if (existing_image_urls) {
            const existingUrls = JSON.parse(existing_image_urls);
            finalImageUrls = [...existingUrls, ...imageUrls];
        }

        const updateData = {
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
            ...(finalImageUrls.length > 0 && { image_urls: finalImageUrls }),
            ...(brochureUrl && { brochure_url: brochureUrl }),
            floor_plans: floorPlansData,
            inventory_files: inventoryFiles,
            developer_id: req.user.entityId,
        };

        const project = await updateProjectService(id, updateData);

        res.json({
            status: 'success',
            message: 'Project updated successfully',
            data: project,
        });
    } catch (error) {
        logger.error('Update project error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update project',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

export const deleteProject = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { id } = req.params;

        if (!req.user?.entityId) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized: No developer linked.',
            });
        }

        if (!id) {
            return res.status(400).json({
                status: 'error',
                message: 'Project ID is required.',
            });
        }

        const result = await deleteProjectService(id, req.user.entityId);

        if (!result) {
            return res.status(404).json({
                status: 'error',
                message: 'Project not found or unauthorized.',
            });
        }

        res.json({
            status: 'success',
            message: 'Project deleted successfully',
        });
    } catch (error) {
        logger.error('Delete project error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete project',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
