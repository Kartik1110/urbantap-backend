import { Router } from 'express';
import {
    getBrokerages,
    createBrokerage,
    getBrokerageDetails,
    getBrokerageAbout,
    getBrokerageListings,
    getBrokerageBrokers,
    getBrokerageJobs,
} from '../controllers/brokerage.controller';

const router = Router();

/* Get all brokerages */
router.get('/brokerages', getBrokerages);

/* Create a new brokerage */
router.post('/brokerages', createBrokerage);

/* Get brokerage details by ID */
router.get('/brokerages/:id', getBrokerageDetails);

router.get('/brokerages/:id/about', getBrokerageAbout);

router.get('/brokerages/:id/listings', getBrokerageListings);

router.get('/brokerages/:id/brokers', getBrokerageBrokers);

router.get('/brokerages/:id/jobs', getBrokerageJobs);

export default router;
