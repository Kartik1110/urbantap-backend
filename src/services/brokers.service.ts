import { Broker } from "@prisma/client";
import prisma from "../utils/prisma";

/* Get broker detail by id */
export const getBrokerDetailService = async (id: string) => {
  try {
    const broker = await prisma.broker.findUnique({
      where: { id },
    });
    return broker;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/* Get broker list */
export const getBrokerListService = async () => {
  try {
    const brokers = await prisma.broker.findMany();
    return brokers;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/* Bulk insert brokers */
export const bulkInsertBrokersService = async (brokers: Broker[]) => {
  try {
    const newBrokers = await prisma.broker.createMany({
      data: brokers,
    });
    return newBrokers;
  } catch (error) {
    console.error(error);
    throw error;
  }
};