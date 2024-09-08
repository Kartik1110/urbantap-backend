import { Router } from 'express';
import { bulkInsertCompanies, getCompanies } from '../controllers/company.controller';

const router = Router();

/* Get all companies */
router.get("/companies", getCompanies);

/* Bulk insert companies */
router.post("/companies/bulk", bulkInsertCompanies);


export default router;
