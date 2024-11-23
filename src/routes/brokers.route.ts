import express from "express";
import { z } from "zod";
import {
  getBrokerDetail,
  getBrokerList,
  bulkInsertBrokers,
  updateBroker,
} from "../controllers/brokers.controller";
import { validateSchema } from "../middlewares/validate.middleware";
import { brokerSchema, updateBrokerSchema, bulkBrokerSchema } from "../schemas/broker.schema";

const router = express.Router();

/* Get all brokers */
router.get("/brokers", getBrokerList);

/* Get a broker by id */
router.get("/brokers/:id", validateSchema(z.object({
  params: z.object({
    id: z.string().uuid()
  })
})), getBrokerDetail);

router.put("/brokers/:id", validateSchema(z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: updateBrokerSchema
})), updateBroker);

export default (upload: any) => {
  router.post('/brokers/bulk', 
    upload.single('file'), 
    validateSchema(bulkBrokerSchema),
    bulkInsertBrokers
  );
  return router;
};
