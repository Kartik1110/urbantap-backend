import { Router } from 'express';
import {
    getDevelopers,
    createDeveloper,
    getDeveloperDetails,
    getDeveloperProjects,
} from '../controllers/developer.controller';

const router = Router();

/* Get all developers */
router.get('/developers', getDevelopers);

/* Create a new developer */
router.post('/developers', createDeveloper);

/* Get developer details by ID */
router.get('/developers/:id', getDeveloperDetails);

/* Get all projects for a specific developer */
router.get('/developers/:id/projects', getDeveloperProjects);

export default router;
