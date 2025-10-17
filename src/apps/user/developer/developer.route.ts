import { Router } from 'express';
import {
    getDevelopers,
    createDeveloper,
    getDeveloperDetails,
} from './developer.controller';

const router = Router();

/* Get all developers */
router.get('/developers', getDevelopers);

/* Create a new developer */
router.post('/developers', createDeveloper);

/* Get developer details by ID */
router.get('/developers/:id', getDeveloperDetails);

export default router;
