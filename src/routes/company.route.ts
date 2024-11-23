import { Router } from 'express';
import { bulkInsertCompanies, getCompanies } from '../controllers/company.controller';
import { validateSchema } from '../middlewares/validate.middleware';
import { bulkCompanySchema } from '../schemas/company.schema';

const router = Router();

/* Get all companies */
router.get("/companies", getCompanies);

/* Bulk insert companies */
router.post("/companies/bulk", validateSchema(bulkCompanySchema), bulkInsertCompanies);

export default router;
