import { Router } from 'express';
import { verifyToken } from '@/utils/verifyToken';
import {
    createProjectSchema,
    updateProjectSchema,
} from '@/schema/project.schema';
import validateSchema from '@/middlewares/validate.middleware';
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    generatePresignedUrls,
} from './project.controller';
import multer from 'multer';
import { requirePermission } from '@/middlewares/rbac.middleware';

const router = Router();

export default (upload: multer.Multer) => {
    /* Project Routes */
    router.post(
        '/admin-user/projects',
        verifyToken,
        upload.any(), // Accept any number of files with any field names
        requirePermission('CREATE_PROJECT'),
        validateSchema(createProjectSchema),
        createProject
    );

    router.get('/admin-user/projects', verifyToken, getProjects);

    /* Get Project by ID Route */
    router.get('/admin-user/projects/:id', verifyToken, getProjectById);

    /* Update Project Route */
    router.put(
        '/admin-user/projects/:id',
        verifyToken,
        upload.any(), // Accept any number of files with any field names
        validateSchema(updateProjectSchema),
        updateProject
    );

    /* Delete Project Route */
    router.delete('/admin-user/projects/:id', verifyToken, deleteProject);

    /* Generate Presigned URLs for File Uploads */
    router.post(
        '/admin-user/projects/presigned-urls',
        verifyToken,
        generatePresignedUrls
    );

    return router;
};
