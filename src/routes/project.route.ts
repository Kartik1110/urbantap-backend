import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject
} from '../controllers/project.controller';

const router = Router();

/* Get all projects */
router.get('/projects', getProjects);

/* Get project by ID */
router.get('/projects/:id', getProjectById);

/* Create a new project */
router.post('/projects', createProject);

export default router;
