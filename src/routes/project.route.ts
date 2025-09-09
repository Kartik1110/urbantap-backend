import { Router } from 'express';
import {
    getProjects,
    getProjectById,
    createProject,
    getProjectFloorPlans,
    getProjectsByDeveloper,
    getFeaturedProjects,
} from '../controllers/project.controller';

const router = Router();

/* Get all projects */
router.get('/projects', getProjects);

/* Get featured projects (most viewed) - MUST be before /projects/:id */
router.get('/projects/featured', getFeaturedProjects);

/* Get all projects for a specific developer */
router.get('/projects/developer/:id', getProjectsByDeveloper);

/* Get project by ID */
router.get('/projects/:id', getProjectById);

/* Create a new project */
router.post('/projects', createProject);

/* Get floor plans for a specific project with optional BHK filtering */
router.get('/projects/:id/floorplans', getProjectFloorPlans);

export default router;
