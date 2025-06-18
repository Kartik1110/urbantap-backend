import { Router } from 'express';
import {
  getBrokerages,
  createBrokerage,
  getBrokerageDetails
} from '../controllers/brokerage.controller';

const router = Router();

/* Get all brokerages */
router.get('/brokerages', getBrokerages);

/* Create a new brokerage */
router.post('/brokerages', createBrokerage);

/* Get brokerage details by ID */
router.get('/brokerages/:id', getBrokerageDetails);

export default router;
