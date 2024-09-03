import { Router } from 'express';
import { bulkInsertCompanies } from '../controllers/company.controller';

const router = Router();

router.post('/companies/bulk', bulkInsertCompanies);

export default router;
