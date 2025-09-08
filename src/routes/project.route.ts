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

/* Get floor plans for a specific project with optional BHK filtering
 * Query parameters:
 * - bhk: Filter by bedroom count (e.g., "1Bhk", "2Bhk", "3Bhk", "Studio", "4+Bhk")
 * Examples:
 * - GET /projects/123/floorplans - Get all floorplans
 * - GET /projects/123/floorplans?bhk=1Bhk - Get only 1BHK floorplans
 * - GET /projects/123/floorplans?bhk=Studio - Get only Studio floorplans
 */
router.get('/projects/:id/floorplans', getProjectFloorPlans);

export default router;
