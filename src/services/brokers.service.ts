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
        sentByConnectionRequests: {
          where: {
            sent_to_id: requestingBroker.id,
          },
        }
      },
    });

    if (!broker) return null;

    const { 
      listings, 
      company, 
      broker1Connections, 
      broker2Connections, 
      sentToConnectionRequests,
      sentByConnectionRequests,
      ...brokerData 
    } = broker;

    const isConnected = broker1Connections.length > 0 || broker2Connections.length > 0;
    const pendingRequest = sentToConnectionRequests.some(
      request => request.status === 'Pending'
    );
    const pendingRequestSent = sentByConnectionRequests.some(
      request => request.status === 'Pending'
    );
    const hasRejectedRequest = sentToConnectionRequests.some(
      request => request.status === 'Rejected'
    );

    let request_id = "";
    let mask = "NOT_CONNECTED"; // Default: Not connected

    if (isConnected) {
      mask = "CONNECTED"; // Connected
    } else if (pendingRequest) {
      mask = "REQUEST_PENDING"; // Request pending
    } else if (pendingRequestSent) {
      mask = "REQUEST_PENDING_SENT"; // Request pending sent
      const connectionRequest = await prisma.connectionRequest.findFirst({
        where: {
          sent_by_id: broker.id,
          sent_to_id: requestingBroker.id,
        },
        select: {
          id: true,
        },
      });

      request_id = connectionRequest?.id || "";

    } else if (hasRejectedRequest) {
      mask = "REQUEST_REJECTED"; // Request rejected
    }

    return {
      listings: listings || [],
      broker: brokerData,
      company: company || {},
      mask,
      request_id,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

/* Get broker list */
export const getBrokerListService = async ({ 
  page, 
  page_size,
  token 
}: { 
  page: number; 
  page_size: number;
  token: string;
}): Promise<{
  brokers: Broker[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}> => {
  try {
    // Decode token to get userId
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET!) as { userId: string };
    
    // Get current broker's ID
    const currentBroker = await prisma.broker.findFirst({
      where: { user_id: decoded.userId },
      select: { id: true },
    });

    const brokers = await prisma.broker.findMany({
      where: {
        // Exclude current broker from results
        NOT: {
          id: currentBroker?.id
        }
      },
      skip: (page - 1) * page_size,
      take: page_size,
      include: {
        company: true,
      },
    });

    // Count total excluding current broker
    const total = await prisma.broker.count({
      where: {
        NOT: {
          id: currentBroker?.id
        }
      }
    });

    if (brokers.length === 0) {
      return {
        brokers: [],
        pagination: {
          total: 0,
          page,
          page_size,
          total_pages: 0,
        }
      };
    }

    return {
      brokers,
      pagination: {
        total,
        page,
        page_size,
        total_pages: Math.ceil(total / page_size)
      }
    };
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
