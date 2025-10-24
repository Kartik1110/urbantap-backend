import logger from '@/utils/logger';
import { Response, Express } from 'express';
import { generatePresignedUrlForMultipleFiles, handleProjectFileUploads } from '@/utils/s3Upload';
import { Currency } from '@prisma/client';
import { AuthenticatedRequest } from '@/utils/verifyToken';
import {
    createProjectService,
    updateProjectService,
    deleteProjectService,
    getProjectsWithRBACService,
    getProjectByIdWithRBACService,
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

        // Handle file uploads using reusable utility function
        const files = req.files as Express.Multer.File[] | undefined;
        const { uploadedFileUrls } = req.body;
        
        const fileHandlingResult = await handleProjectFileUploads(files, uploadedFileUrls, 'create');

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
            min_bedrooms,
            max_bedrooms,
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
                image_urls: fileHandlingResult.floorPlanImages[index]
                    ? [fileHandlingResult.floorPlanImages[index]]
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
            min_bedrooms,
            max_bedrooms,
            image_urls: fileHandlingResult.imageUrls,
            brochure_url: fileHandlingResult.brochureUrl,
            floor_plans: floorPlansData,
            inventory_files: fileHandlingResult.inventoryFiles,
            company_id: req.user.companyId!,
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
        const adminUserId = req.user?.id;
        if (!adminUserId) {
            return res.status(401).json({ message: 'Admin user ID not found' });
        }

        const projects = await getProjectsWithRBACService(adminUserId);

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

export const getProjectById = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const projectId = req.params.id;
        const adminUserId = req.user?.id;
        if (!adminUserId) {
            return res.status(401).json({ message: 'Admin user ID not found' });
        }

        const project = await getProjectByIdWithRBACService(
            adminUserId,
            projectId
        );

        if (!project) {
            return res
                .status(404)
                .json({ status: 'error', message: 'Project not found' });
        }

        res.status(200).json({
            status: 'success',
            data: project,
        });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
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

        // Handle file uploads using reusable utility function
        const files = req.files as Express.Multer.File[] | undefined;
        const { uploadedFileUrls } = req.body;
        
        const fileHandlingResult = await handleProjectFileUploads(files, uploadedFileUrls, 'update');

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
            min_bedrooms,
            max_bedrooms,
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
                image_urls: fileHandlingResult.floorPlanImages[index]
                    ? [fileHandlingResult.floorPlanImages[index]]
                    : fp.existing_image_urls || [],
            }));
        }

         // Combine existing images with new ones (for legacy approach)
         let finalImageUrls = fileHandlingResult.imageUrls;
         if (existing_image_urls) {
             const existingUrls = JSON.parse(existing_image_urls);
             finalImageUrls = [...existingUrls, ...fileHandlingResult.imageUrls];
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
            ...(min_bedrooms && { min_bedrooms }),
            ...(max_bedrooms && { max_bedrooms }),
             ...(finalImageUrls.length > 0 && { image_urls: finalImageUrls }),
             ...(fileHandlingResult.brochureUrl && { brochure_url: fileHandlingResult.brochureUrl }),
             floor_plans: floorPlansData,
             inventory_files: fileHandlingResult.inventoryFiles,
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

export const generatePresignedUrls = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const { files } = req.body;

        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Files array is required',
            });
        }

        // Validate file structure
        const validFileTypes = ['image', 'brochure', 'inventory', 'floor_plan'];
        
        for (const file of files) {
            if (!file.fileType || !validFileTypes.includes(file.fileType)) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid file type. Must be one of: ${validFileTypes.join(', ')}`,
                });
            }
            if (!file.originalFileName) {
                return res.status(400).json({
                    status: 'error',
                    message: 'originalFileName is required for each file',
                });
            }
        }

        const presignedUrls = await generatePresignedUrlForMultipleFiles(files);

        res.json({
            status: 'success',
            message: 'Presigned URLs generated successfully',
            data: presignedUrls,
        });
    } catch (error) {
        logger.error('Generate presigned URLs error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to generate presigned URLs',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
