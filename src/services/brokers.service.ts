import prisma from "../utils/prisma";

/* Get broker detail by id */
export const getBrokerDetailService = async (id: number) => {
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
