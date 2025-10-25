import logger from '@/utils/logger';
import { Response, Express } from 'express';
import { uploadToS3 } from '@/utils/s3Upload';
import { Currency } from '@prisma/client';
import { AuthenticatedRequest } from '@/utils/verifyToken';
import {
    createProjectService,
    updateProjectService,
    deleteProjectService,
    getProjectsWithRBACService,
    getProjectByIdWithRBACService,
} from './project.service';
import {
    isChunkedUpload,
    getChunkInfo,
    processChunkedFile,
} from '@/utils/chunkedFileUpload';
import fs from 'fs';
import path from 'path';

// Helper function to retrieve assembled chunked files
async function retrieveAssembledChunkedFiles(
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

// Helper function to process chunked uploads
async function processChunkedUploads(
    files: Express.Multer.File[] | undefined,
    req: AuthenticatedRequest
): Promise<{ files: Express.Multer.File[] | undefined; returnEarly: boolean }> {
    if (!files || files.length === 0) {
        return { files, returnEarly: false };
    }

    // Check if this is a chunked upload request
    if (isChunkedUpload(req)) {
        const chunkInfo = getChunkInfo(req);
        
        if (chunkInfo) {
            // Process chunk and assemble if complete
            const assembledPath = await processChunkedFile(files[0], chunkInfo);
            
            if (assembledPath) {
                // File is complete - convert to Multer file format and add to files array
                const assembledBuffer = fs.readFileSync(assembledPath);
                const assembledFile: Express.Multer.File = {
                    fieldname: files[0].fieldname,
                    originalname: chunkInfo.fileName,
                    encoding: files[0].encoding,
                    mimetype: chunkInfo.mimeType,
                    buffer: assembledBuffer,
                    size: assembledBuffer.length,
                    destination: '',
                    filename: '',
                    path: assembledPath,
                    stream: fs.createReadStream(assembledPath),
                };
                
                // Clean up assembled file after use
                process.nextTick(() => {
                    try {
                        fs.unlinkSync(assembledPath);
                    } catch (e) {
                        logger.error('Error cleaning up assembled file:', e);
                    }
                });
                
                return {
                    files: [assembledFile],
                    returnEarly: false,
                };
            } else {
                // Waiting for more chunks
                return {
                    files: undefined,
                    returnEarly: true,
                };
            }
        }
    }

    return { files, returnEarly: false };
}

export const uploadChunk = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const files = req.files as Express.Multer.File[] | undefined;
        
        if (!files || files.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No file provided',
            });
        }

        const chunkInfo = getChunkInfo(req);
        
        if (!chunkInfo) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid chunk information',
            });
        }

        // Process chunk and assemble if complete
        const assembledPath = await processChunkedFile(files[0], chunkInfo);
        
        if (assembledPath) {
            // File is complete
            return res.json({
                status: 'success',
                message: 'File uploaded successfully',
                chunksComplete: true,
                fileId: chunkInfo.fileId,
            });
        } else {
            // Waiting for more chunks
            return res.json({
                status: 'success',
                message: 'Chunk received successfully',
                chunksComplete: false,
            });
        }
    } catch (error) {
        logger.error('Chunk upload error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to upload chunk',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

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

        let files = req.files as Express.Multer.File[] | undefined;

        // Handle assembled chunked files
        files = await retrieveAssembledChunkedFiles(files, req);

        // Store assembled file paths for cleanup after S3 upload
        const assembledFilePaths: string[] = [];
        if (files) {
            files.forEach(file => {
                if (file.path && file.path.includes('assembled')) {
                    assembledFilePaths.push(file.path);
                }
            });
        }

        // Organize files by field name
        const organizedFiles: { [key: string]: Express.Multer.File[] } = {};
        if (files && Array.isArray(files)) {
            files.forEach((file) => {
                if (!organizedFiles[file.fieldname]) {
                    organizedFiles[file.fieldname] = [];
                }
                organizedFiles[file.fieldname].push(file);
            });
        }

        // Upload project images
        let imageUrls: string[] = [];
        if (organizedFiles.image_urls) {
            for (const file of organizedFiles.image_urls) {
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
        if (organizedFiles.file_url?.[0]) {
            const ext = organizedFiles.file_url[0].originalname.split('.').pop();
            brochureUrl = await uploadToS3(
                organizedFiles.file_url[0].path,
                `projects/brochures/${Date.now()}_brochure.${ext}`
            );
        }

        // Upload inventory file
        let inventoryFiles: string[] = [];
        if (organizedFiles.inventory_file?.[0]) {
            const ext = organizedFiles.inventory_file[0].originalname.split('.').pop();
            const url = await uploadToS3(
                organizedFiles.inventory_file[0].path,
                `projects/inventory/${Date.now()}_inventory.${ext}`
            );
            inventoryFiles.push(url);
        }

        // Upload floor plan images dynamically
        const floorPlanImages: { [index: number]: string } = {};
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
                    floorPlanImages[index] = url;
                }
            }
        }

        // Clean up assembled files after S3 upload
        assembledFilePaths.forEach(filePath => {
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                logger.error(`Error cleaning up assembled file ${filePath}:`, e);
            }
        });

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
            min_bedrooms,
            max_bedrooms,
            image_urls: imageUrls,
            brochure_url: brochureUrl,
            floor_plans: floorPlansData,
            inventory_files: inventoryFiles,
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

        let files = req.files as Express.Multer.File[] | undefined;

        // Handle assembled chunked files
        files = await retrieveAssembledChunkedFiles(files, req);

        // Store assembled file paths for cleanup after S3 upload
        const assembledFilePaths: string[] = [];
        if (files) {
            files.forEach(file => {
                if (file.path && file.path.includes('assembled')) {
                    assembledFilePaths.push(file.path);
                }
            });
        }

        // Organize files by field name
        const organizedFiles: { [key: string]: Express.Multer.File[] } = {};
        if (files && Array.isArray(files)) {
            files.forEach((file) => {
                if (!organizedFiles[file.fieldname]) {
                    organizedFiles[file.fieldname] = [];
                }
                organizedFiles[file.fieldname].push(file);
            });
        }

        // Upload new project images if provided
        let imageUrls: string[] = [];
        if (organizedFiles.image_urls) {
            for (const file of organizedFiles.image_urls) {
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
        if (organizedFiles.file_url?.[0]) {
            const ext = organizedFiles.file_url[0].originalname.split('.').pop();
            brochureUrl = await uploadToS3(
                organizedFiles.file_url[0].path,
                `projects/brochures/${Date.now()}_brochure.${ext}`
            );
        }

        // Upload new inventory file if provided
        let inventoryFiles: string[] = [];
        if (organizedFiles.inventory_file?.[0]) {
            const ext = organizedFiles.inventory_file[0].originalname.split('.').pop();
            const url = await uploadToS3(
                organizedFiles.inventory_file[0].path,
                `projects/inventory/${Date.now()}_inventory.${ext}`
            );
            inventoryFiles.push(url);
        }

        // Upload new floor plan images dynamically
        const floorPlanImages: { [index: number]: string } = {};
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
                    floorPlanImages[index] = url;
                }
            }
        }

        // Clean up assembled files after S3 upload
        assembledFilePaths.forEach(filePath => {
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                logger.error(`Error cleaning up assembled file ${filePath}:`, e);
            }
        });

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
            ...(min_bedrooms && { min_bedrooms }),
            ...(max_bedrooms && { max_bedrooms }),
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
