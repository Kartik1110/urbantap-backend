import { Router } from 'express';
import {
    getListings,
    bulkInsertListings,
    deleteListing,
    getListingById,
    reportListing,
    editListingController,
    generateListingFromText,
    getPopularLocalities,
    getFeaturedListings,
    getRecentListings,
    getListingAppreciation,
    getListingROIReport,
    getAIReport,
    createListing,
} from '../controllers/listings.controller';

const router = Router();

/* Get all listings */
router.get('/listings', getListings);

router.get('/listings/featured', getFeaturedListings);

router.get('/listings/recent', getRecentListings);

router.get('/listings/:id', getListingById);

router.get('/listings/:id/appreciation', getListingAppreciation);

router.get('/listings/:id/roi-report', getListingROIReport);

router.get('/listings/:id/ai-report', getAIReport);

/* Bulk insert listings */
export default (upload: any) => {
    router.post('/listings/bulk', upload.array('images'), bulkInsertListings);

    router.post('/listings', upload.array('images'), createListing);

    router.put('/listings/:id', upload.array('images'), editListingController);

    /* Generate Listing from text */
    router.post('/listings/generate', generateListingFromText);

    return router;
};

//  Get popular localities
router.get('/listings/locality/popular', getPopularLocalities);

/* Report a listing */
router.post('/listings/report/:id', reportListing);

/* Delete Listing by id */
router.delete('/deletelisting', deleteListing);
