import { Router } from 'express';
import { adminMiddleware } from '@/middlewares/admin.middleware';
import {
    updateListingStatus,
    getUserList,
    getAdminListings,
    getBrokerListforAdmins,
    assignCredits,
} from './admin.controller';

const router = Router();

router.use(adminMiddleware);

// Fetch listings (pending first, then approved)
router.get('/admin/listings', getAdminListings);

// Update listing status
router.put('/admin/listings/:id/status', updateListingStatus);

// Fetch Users
router.get('/admin/users', getUserList);

// Fetch Brokers List
router.get('/admin/brokers', getBrokerListforAdmins);

// Assign credits to a company (for system admins to assign credits) - by Ruba
router.post('/admin/credits/assign', assignCredits);

export default router;
