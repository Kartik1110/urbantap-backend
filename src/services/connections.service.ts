import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const fetchConnectionsByBrokerId = async (broker_id: string) => {
    return prisma.connections.findMany({
        where: { broker1_id: broker_id },
        select: {
            id: true,
            broker1_id: true,
            broker2_id: true,
            broker2_name: true,
            broker2_company: true,
            timestamp: true
        }
    });
};

export const addConnectionRequest = async (broker_id: string, sent_to_id: string) => {
    await prisma.$transaction(async (prisma) => {
        // Step 1: Create the connection request with a Pending status
        const connectionRequest = await prisma.connectionRequest.create({
            data: {
                sent_by_id: broker_id,
                sent_to_id,
                status: 'Pending'
            }
        });

        // Step 2: Create a notification for the recipient
        await prisma.notification.create({
            data: {
                broker_id: sent_to_id,
                text: `New connection request received from broker ${broker_id}`,
                type: 'Network',
                connectionRequest_id: connectionRequest.id
            }
        });
    });
};

export const updateConnectionStatus = async (request_id: string, broker_id: string, status: string) => {
    await prisma.$transaction(async (prisma) => {
        // Update the status of the connection request
        const connectionRequest = await prisma.connectionRequest.update({
            where: { id: request_id },
            data: { status }
        });

        if (status === 'Accepted') {
            const { sent_by_id, sent_to_id } = connectionRequest;

            // Fetch broker details
            const brokerSentBy = await prisma.broker.findUnique({ where: { id: sent_by_id } });
            const brokerSentTo = await prisma.broker.findUnique({ where: { id: sent_to_id } });

            if (brokerSentBy && brokerSentTo) {
                // Create a notification for the accepted connection
                await prisma.notification.create({
                    data: {
                        broker_id: sent_to_id,
                        text: `Connection request from broker ${sent_by_id} has been accepted.`,
                        type: 'Network',
                        connectionRequest_id: request_id
                    }
                });

                // Create two connection objects to establish mutual connection
                await prisma.connections.createMany({
                    data: [
                        {
                            broker1_id: sent_by_id,
                            broker2_id: sent_to_id,
                            broker2_name: brokerSentTo.name,
                            broker2_company: brokerSentTo.company_id
                        },
                        {
                            broker1_id: sent_to_id,
                            broker2_id: sent_by_id,
                            broker2_name: brokerSentBy.name,
                            broker2_company: brokerSentBy.company_id
                        }
                    ]
                });
            }
        }
    });
};
