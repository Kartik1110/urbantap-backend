import { Router } from 'express';
import { getBrokerDetail, getBrokerList } from '../controllers/brokers.controller';

const router = Router();

router.get('/brokers', getBrokerList);
router.get('/brokers/:id', getBrokerDetail);

export default router;
