import { Router } from 'express';
import { bulkInsertCompanies, getCompanies } from '../controllers/company.controller';

const router = Router();

router.post("/companies/bulk", bulkInsertCompanies);
router.get("/companies", getCompanies);

export default router;
