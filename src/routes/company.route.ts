import { Router } from 'express';
import {
    bulkInsertCompanies,
    getCompanies,
    getBrokersByCompanyId,
    updateCompany,
    getListingsByCompanyId,
    getCompaniesByUserId,
} from '../controllers/company.controller';

const router = Router();

/* Get all companies */
router.get('/companies', getCompanies);

/* Bulk insert companies */
router.post('/companies/bulk', bulkInsertCompanies);

/* Get all brokers by company ID */
router.get('/companies/:id/brokers', getBrokersByCompanyId);

/* Edit a company by ID */
router.put('/companies/:id', updateCompany);

/* Get all listings of brokers under a company */
router.get('/companies/:companyId/listings', getListingsByCompanyId);

router.get('/companies/user/:userId', getCompaniesByUserId);

export default router;
