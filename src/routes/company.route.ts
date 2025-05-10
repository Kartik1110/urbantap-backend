import { Router } from 'express';
import { bulkInsertCompanies, getCompanies } from '../controllers/company.controller';
import validateSchema from "../middlewares/validate.middleware";
import { bulkInsertCompaniesSchema } from "../schema/company.schema";

const router = Router();

/* Get all companies */
router.get("/companies", getCompanies);

/* Bulk insert companies */
router.post("/companies/bulk",validateSchema(bulkInsertCompaniesSchema),bulkInsertCompanies);


export default router;
