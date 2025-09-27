import { Router } from 'express';
import { verifyToken } from '../../../utils/verifyToken';
import {
    bulkInsertListingsAdmin,
    getListingsForBrokerage,
    getSponsoredListingsForBrokerage,
    bulkUpdateListingsSponsorshipController,
} from './listing.controller';

const router = Router();

export default (upload: any) => {
    /* Bulk insert listings */
    router.post(
        '/admin-user/listings/bulk',
        verifyToken,
        upload.array('images'),
        bulkInsertListingsAdmin
    );

    return router;
};

router.get('/admin-user/listings', verifyToken, getListingsForBrokerage);

router.get(
    '/admin-user/listings/sponsored',
    verifyToken,
    getSponsoredListingsForBrokerage
);

/* Bulk update listings sponsorship */
router.put(
    '/admin-user/listings/sponsor',
    verifyToken,
    bulkUpdateListingsSponsorshipController
);
