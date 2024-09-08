import express from "express";
import { getBrokerDetail, getBrokerList, bulkInsertBrokers } from '../controllers/brokers.controller';

const router = express.Router();

/* Get all brokers */ 
router.get('/brokers', getBrokerList);

/* Get a broker by id */ 
router.get('/brokers/:id', getBrokerDetail);

export default (upload: any) => {
  router.post('/brokers/bulk', upload.single('profile_pics'), bulkInsertBrokers);
  return router;
};
