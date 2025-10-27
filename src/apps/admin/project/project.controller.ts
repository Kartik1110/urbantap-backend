import logger from '@/utils/logger';
import { Response, Express } from 'express';
import { AuthenticatedRequest } from '@/utils/verifyToken';
import {
    createProjectService,
    updateProjectService,
    deleteProjectService,
    getProjectsWithRBACService,
    getProjectByIdWithRBACService,
    retrieveAssembledChunkedFiles,
    processProjectFiles,
    cleanupTemporaryFiles,
    parseProjectBody,
    parseUpdateProjectBody,
} from './project.service';
import {
    getChunkInfo,
    processChunkedFile,
} from '@/utils/chunkedFileUpload';

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
    let processedFiles: any = null;
    try {
        if (!req.user?.entityId) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized: No developer linked.',
            });
        }

        // Handle assembled chunked files
        let files = req.files as Express.Multer.File[] | undefined;
        files = await retrieveAssembledChunkedFiles(files, req);

        // Process files and upload to S3
        processedFiles = await processProjectFiles(files);

        // Parse and structure project data
        const projectData = parseProjectBody(req.body, processedFiles, req.user);

        // Create project
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
    } finally {
        // Always clean up files after S3 upload (success or failure)
        const allFilePaths = [
            ...(processedFiles?.assembledFilePaths || []),
            ...(processedFiles?.multerTempFilePaths || [])
        ];
        if (allFilePaths.length > 0) {
            cleanupTemporaryFiles(allFilePaths);
        }
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
    let processedFiles: any = null;
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

        // Handle assembled chunked files
        let files = req.files as Express.Multer.File[] | undefined;
        files = await retrieveAssembledChunkedFiles(files, req);

        // Process files and upload to S3
        processedFiles = await processProjectFiles(files);

        // Parse and structure update data
        const updateData = parseUpdateProjectBody(req.body, processedFiles, req.user);

        // Update project
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
    } finally {
        // Always clean up files after S3 upload (success or failure)
        const allFilePaths = [
            ...(processedFiles?.assembledFilePaths || []),
            ...(processedFiles?.multerTempFilePaths || [])
        ];
        if (allFilePaths.length > 0) {
            cleanupTemporaryFiles(allFilePaths);
        }
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
