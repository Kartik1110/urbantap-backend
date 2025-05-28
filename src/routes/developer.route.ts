import { Router } from 'express';
import { getDevelopers,createDeveloper } from '../controllers/developer.controller';

const router = Router();

/* Get all developers */
router.get('/developers', getDevelopers);

/* Create a new developer */
router.post("/developers", createDeveloper);

export default router;