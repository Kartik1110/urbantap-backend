import { PrismaClient } from "@prisma/client";
import { createNotification } from './notifications.service';

const prisma = new PrismaClient();

export const fetchConnectionsByBrokerId = async (broker_id: string) => {
  const connections = await prisma.connections.findMany({
    where: { broker1_id: broker_id },
    distinct: ["broker2_id"],
    orderBy: {
      timestamp: "desc",
    },
    select: {
      id: true,
      timestamp: true,
      broker2: {
        select: {
          id: true,
          name: true,
          email: true,
          info: true,
          y_o_e: true,
          languages: true,
          is_certified: true,
          profile_pic: true,
          w_number: true,
          ig_link: true,
          linkedin_link: true,
          designation: true,
          company_id: true,
          user_id: true,
          company: {
            select: {
              id: true,
              name: true,
              description: true,
              logo: true,
            },
          },
        },
      },
    },
  });

  return connections.map(({ broker2, ...rest }) => ({
    ...rest,
    broker: broker2,
  }));
};

export const fetchConnectionRequestsByBrokerId = async (broker_id: string) => {
  return prisma.connectionRequest.findMany({
    where: { sent_to_id: broker_id, status: "Pending" },
    select: {
      id: true,
      timestamp: true,
      status: true,
      text: true,
      sent_by: {
        select: {
          id: true,
          name: true,
          profile_pic: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
};

export const addConnectionRequest = async (
  broker_id: string,
  sent_to_id: string,
  text?: string
) => {
  const checkIfConnectionRequestExists =
    await prisma.connectionRequest.findFirst({
      where: { sent_by_id: broker_id, sent_to_id, status: "Pending" },
    });

  if (checkIfConnectionRequestExists) {
    return {
      message: "You have already sent a connection request to this broker",
    };
  }

  const checkIfConnectionRequestIsRejected =
    await prisma.connectionRequest.findFirst({
      where: { sent_by_id: broker_id, sent_to_id, status: "Rejected" },
    });

  if (checkIfConnectionRequestIsRejected) {
    return {
      message: "This broker has rejected your connection request",
    };
  }

  // TODO: Add transaction
  // await prisma.$transaction(async (prisma) => {
    // Step 1: Create the connection request with a Pending status
    const connectionRequest = await prisma.connectionRequest.create({
      data: {
        sent_by_id: broker_id,
        sent_to_id,
        status: "Pending",
        text: text || "",
      },
    });

    const sentByBrokerName = await prisma.broker.findUnique({
      where: { id: broker_id },
      select: {
        name: true,
      },
    });

    // Step 2: Create a notification for the recipient using the notification service
    await createNotification({
      sent_by_id: broker_id,
      broker_id: sent_to_id,
      message: text || "",
      text: `New connection request received from broker ${sentByBrokerName?.name}`,
      type: "Network",
      connectionRequest_id: connectionRequest.id,
    });
  // });

  return {
    message: "Connection request created successfully",
  };
};

export const updateConnectionStatus = async (
  request_id: string,
  broker_id: string,
  status: "Accepted" | "Rejected" | "Pending"
) => {
  await prisma.$transaction(async (prisma) => {
    // Update the status of the connection request
    const connectionRequest = await prisma.connectionRequest.update({
      where: { id: request_id },
      data: { status },
    });

    if (status === "Accepted") {
      const { sent_by_id, sent_to_id } = connectionRequest;

      // Fetch broker details
      const brokerSentBy = await prisma.broker.findUnique({
        where: { id: sent_by_id },
      });
      const brokerSentTo = await prisma.broker.findUnique({
        where: { id: sent_to_id },
      });

      if (brokerSentBy && brokerSentTo) {
        const sentByBrokerName = await prisma.broker.findUnique({
          where: { id: sent_by_id },
          select: {
            name: true,
          },
        });

        // Create a notification for the accepted connection using the notification service
        await createNotification({
          sent_by_id: sent_by_id,
          broker_id: sent_to_id,
          text: `Connection request from broker ${sentByBrokerName?.name} has been accepted.`,
          type: "Network",
          connectionRequest_id: request_id,
        });

        // Create two connection objects to establish mutual connection
        await prisma.connections.createMany({
          data: [
            {
              broker1_id: sent_by_id,
              broker2_id: sent_to_id,
            },
            {
              broker1_id: sent_to_id,
              broker2_id: sent_by_id,
            },
          ],
        });
      }
    }
    if (status === "Rejected") {
      await prisma.connectionRequest.delete({
        where: { id: request_id },
      });
    }
  });
};
