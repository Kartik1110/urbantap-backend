import { Broker } from "@prisma/client";
import prisma from "../utils/prisma";

/* Get broker detail by id */
export const getBrokerDetailService = async (id: string) => {
  try {
    const broker = await prisma.broker.findUnique({
      where: { id },
      include: {
        listings: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            min_price: true,
            max_price: true,
            sq_ft: true,
            locality: true,
            type: true,
            category: true,
            looking_for: true,
            rental_frequency: true,
            no_of_bedrooms: true,
            no_of_bathrooms: true,
            furnished: true,
            city: true,
            address: true,
            amenities: true,
            image_urls: true,
            created_at: true,
          },
        },
        company: true,
      },
    });

    if (!broker) {
      return null;
    }

    const { listings, company, ...brokerData } = broker;

    return {
      listings: listings || [],
      broker: brokerData,
      company: company || {},
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/* Get broker list */
export const getBrokerListService = async () => {
  try {
    const brokers = await prisma.broker.findMany({
      include: {
        company: true,
      },
    });
    return brokers;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/* Bulk insert brokers */
export const bulkInsertBrokersService = async (brokers: Broker[]) => {
  try {
    // add brokers exists check
    const existingBrokers = await prisma.broker.findMany({
      where: {
        email: {
          in: brokers.map((broker) => broker.email),
        },
      },
    });

    if (existingBrokers.length > 0) {
      throw new Error(
        `Brokers with emails ${existingBrokers
          .map((broker) => broker.email)
          .join(", ")} already exist`
      );
    }

    await prisma.broker.createMany({
      data: brokers,
    });

    const createdBrokers = await prisma.broker.findMany({
      where: {
        email: {
          in: brokers.map((broker) => broker.email),
        },
      },
    });

    return createdBrokers.map((broker) => broker.id);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/* Update a broker by id */
export const updateBrokerService = async (brokerId: string, data: any) => {
  try {
    await prisma.broker.update({
      where: { id: brokerId },
      data: data,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
