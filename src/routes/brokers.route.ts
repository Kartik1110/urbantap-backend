// import express from "express";
// import {
//   getBrokerDetail,
//   getBrokerList,
//   bulkInsertBrokers,
//   updateBroker,
//   blockBroker,
// } from "../controllers/brokers.controller";

// const router = express.Router();

// /* Get all brokers */
// router.get("/brokers", getBrokerList);

// /* Get a broker by id */
// router.get("/brokers/:id", getBrokerDetail);

// /* Block a broker */
// router.post("/brokers/:id/block", blockBroker);

// export default (upload: any) => {
//   router.put("/brokers/:id", upload.single('file'), updateBroker);
//   router.post('/brokers/bulk', upload.single('file'), bulkInsertBrokers);
//   return router;
// };

import express from "express";
import {
  getBrokerDetail,
  getBrokerList,
  bulkInsertBrokers,
  updateBroker,
  blockBroker,
} from "../controllers/brokers.controller";
import validateSchema from "../middlewares/validate.middleware";
import {
  
  blockBrokerSchema,
} from "../schema/broker.schema";

const router = express.Router();

router.get("/brokers", getBrokerList);

/* Get a broker by id */
router.get("/brokers/:id", getBrokerDetail);

router.post("/brokers/:id/block", validateSchema(blockBrokerSchema), blockBroker);

export default (upload: any) => {
  router.put("/brokers/:id", upload.single("file"), updateBroker);
  router.post("/brokers/bulk", upload.single("file"), bulkInsertBrokers);
  return router;
};
