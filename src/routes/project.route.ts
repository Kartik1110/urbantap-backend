import { Router } from 'express';
import {
    getProjects,
    getProjectById,
    createProject,
    getProjectFloorPlans,
    getProjectsByDeveloper,
} from '../controllers/project.controller';

const router = Router();

/* Get all projects */
router.get('/projects', getProjects);

/* Get project by ID */
router.get('/projects/:id', getProjectById);

/* Create a new project */
router.post('/projects', createProject);

/* Get floor plans for a specific project */
router.get('/projects/:id/floorplans', getProjectFloorPlans);

/* Get all projects for a specific developer */
router.get('/projects/developer/:id', getProjectsByDeveloper);

export default router;
