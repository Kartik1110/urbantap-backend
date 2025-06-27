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
  bulkInsertBrokersSchema,
  updateBrokerDataSchema,
} from "../schema/broker.schema";

const router = express.Router();

router.get("/brokers", getBrokerList);

router.get("/brokers/:id", getBrokerDetail);

router.post("/brokers/:id/block", blockBroker);

export default (upload: any) => {
  router.put("/brokers/:id", upload.single("file"),validateSchema(updateBrokerDataSchema), updateBroker);
  router.post("/brokers/bulk", upload.single("file"),validateSchema(bulkInsertBrokersSchema),  bulkInsertBrokers);
  return router;
};