import { Router } from 'express';
import { getBrokerDetail, getBrokerList } from '../controllers/brokers.controller';
import { bulkInsertBrokers } from '../controllers/brokers.controller';

const router = Router();

router.get('/brokers', getBrokerList);
router.get('/brokers/:id', getBrokerDetail);
router.post('/brokers/bulk', bulkInsertBrokers);

export default router;
