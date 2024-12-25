import { Broker } from "@prisma/client";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";

/* Get broker detail by id */
export const getBrokerDetailService = async (id: string, token: string) => {
  try {
    // Decode token to get userId
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET!) as { userId: string };
    
    // Get user details including role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // If user is not a broker, return basic details with mask 0
    // if (user.role !== 'BROKER') {
    //   const broker = await prisma.broker.findUnique({
    //     where: { id },
    //     include: {
    //       listings: {
    //         select: {
    //           id: true,
    //           title: true,
    //           description: true,
    //           image: true,
    //           min_price: true,
    //           max_price: true,
    //           sq_ft: true,
    //           type: true,
    //           category: true,
    //           looking_for: true,
    //           rental_frequency: true,
    //           no_of_bedrooms: true,
    //           no_of_bathrooms: true,
    //           furnished: true,
    //           city: true,
    //           address: true,
    //           amenities: true,
    //           image_urls: true,
    //           created_at: true,
    //         },
    //       },
    //       company: true,
    //     },
    //   });

    //   if (!broker) return null;
    //   const { listings, company, ...brokerData } = broker;
    //   return {
    //     listings: listings || [],
    //     broker: brokerData,
    //     company: company || {},
    //     mask: null,
    //   };
    // }

    // Get requesting broker's ID using the user_id
    const requestingBroker = await prisma.broker.findFirst({
      where: { user_id: decoded.userId },
      select: { id: true },
    });

    if (!requestingBroker) {
      throw new Error('Requesting broker not found');
    }

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
        broker1Connections: {
          where: {
            broker2_id: requestingBroker.id,
          },
        },
        broker2Connections: {
          where: {
            broker1_id: requestingBroker.id,
          },
        },
        sentToConnectionRequests: {
          where: {
            sent_by_id: requestingBroker.id,
          },
        },
      },
    });

    if (!broker) return null;

    const { 
      listings, 
      company, 
      broker1Connections, 
      broker2Connections, 
      sentToConnectionRequests,
      ...brokerData 
    } = broker;

    const isConnected = broker1Connections.length > 0 || broker2Connections.length > 0;
    const pendingRequest = sentToConnectionRequests.some(
      request => request.status === 'Pending'
    );
    const hasRejectedRequest = sentToConnectionRequests.some(
      request => request.status === 'Rejected'
    );

    let mask = "NOT_CONNECTED"; // Default: Not connected
    if (isConnected) {
      mask = "CONNECTED"; // Connected
    } else if (pendingRequest) {
      mask = "REQUEST_PENDING"; // Request pending
    } else if (hasRejectedRequest) {
      mask = "REQUEST_REJECTED"; // Request rejected
    }

    return {
      listings: listings || [],
      broker: brokerData,
      company: company || {},
      mask,
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
    // If company_id is empty string, set it to null instead
    if (data.company_id === "") {
      data.company_id = null;
    }

    await prisma.broker.update({
      where: { id: brokerId },
      data: data,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
