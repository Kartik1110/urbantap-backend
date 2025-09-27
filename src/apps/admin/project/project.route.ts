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
    updateProject,
    deleteProject,
} from './project.controller';
import multer from 'multer';

const router = Router();

export default (upload: multer.Multer) => {
    /* Project Routes */
    router.post(
        '/admin-user/projects',
        verifyToken,
        upload.fields([
            { name: 'image_urls', maxCount: 20 },
            { name: 'file_url', maxCount: 1 },
            { name: 'inventory_file', maxCount: 1 },
            { name: 'floor_plan_image_0', maxCount: 1 },
            { name: 'floor_plan_image_1', maxCount: 1 },
            { name: 'floor_plan_image_2', maxCount: 1 },
            { name: 'floor_plan_image_3', maxCount: 1 },
            { name: 'floor_plan_image_4', maxCount: 1 },
            { name: 'floor_plan_image_5', maxCount: 1 },
            { name: 'floor_plan_image_6', maxCount: 1 },
            { name: 'floor_plan_image_7', maxCount: 1 },
            { name: 'floor_plan_image_8', maxCount: 1 },
            { name: 'floor_plan_image_9', maxCount: 1 },
        ]),
        validateSchema(createProjectSchema),
        createProject
    );

    router.get('/admin-user/projects', verifyToken, getProjects);

    /* Update Project Route */
    router.put(
        '/admin-user/projects/:id',
        verifyToken,
        upload.fields([
            { name: 'image_urls', maxCount: 20 },
            { name: 'file_url', maxCount: 1 },
            { name: 'inventory_file', maxCount: 1 },
            { name: 'floor_plan_image_0', maxCount: 1 },
            { name: 'floor_plan_image_1', maxCount: 1 },
            { name: 'floor_plan_image_2', maxCount: 1 },
            { name: 'floor_plan_image_3', maxCount: 1 },
            { name: 'floor_plan_image_4', maxCount: 1 },
            { name: 'floor_plan_image_5', maxCount: 1 },
            { name: 'floor_plan_image_6', maxCount: 1 },
            { name: 'floor_plan_image_7', maxCount: 1 },
            { name: 'floor_plan_image_8', maxCount: 1 },
            { name: 'floor_plan_image_9', maxCount: 1 },
        ]),
        validateSchema(updateProjectSchema),
        updateProject
    );

    /* Delete Project Route */
    router.delete('/admin-user/projects/:id', verifyToken, deleteProject);

    return router;
};
