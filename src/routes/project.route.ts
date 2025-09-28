import { Router } from 'express';
import {
    getProjects,
    getProjectById,
    getProjectByName,
    createProject,
    getProjectFloorPlans,
    getProjectsByDeveloper,
    getFeaturedProjects,
    // generateProjectROIReport,
    // getAIReport,
    generateProjectROIReportV2,
    getAIReportV2,
} from '../controllers/project.controller';

const router = Router();

/* Get all projects */
router.get('/projects', getProjects);

/* Get featured projects (most viewed) - MUST be before /projects/:id */
router.get('/projects/featured', getFeaturedProjects);

/* Get all projects for a specific developer */
router.get('/projects/developer/:id', getProjectsByDeveloper);

/* Get project by name */
router.get('/projects/name/:name', getProjectByName);

/* Get project by ID */
router.get('/projects/:id', getProjectById);

/* Create a new project */
router.post('/projects', createProject);

/* Generate ROI report for project */
router.get('/projects/:id/roi-report', generateProjectROIReportV2);

/* Get AI report for a project */
router.get('/projects/:id/ai-report', getAIReportV2);

/* Get floor plans for a specific project with optional BHK filtering */
router.get('/projects/:id/floorplans', getProjectFloorPlans);

export default router;
