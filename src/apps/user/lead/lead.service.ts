import jwt from 'jsonwebtoken';
import prisma from '@/utils/prisma';
import logger from '@/utils/logger';

/* Get leads for the logged-in broker */
export const getLeadsService = async (token: string) => {
    try {
        // Decode token to get userId
        const decoded = jwt.verify(
            token.replace('Bearer ', ''),
            process.env.JWT_SECRET!
        ) as { userId: string };

        // Get broker details using the user_id
        const broker = await prisma.broker.findFirst({
            where: { user_id: decoded.userId },
            select: { id: true },
        });

        if (!broker) {
            throw new Error('Broker not found');
        }

        // Fetch all leads associated with this broker
        const leads = await prisma.lead.findMany({
            where: {
                broker: {
                    some: {
                        id: broker.id,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                email: true,
                country_code: true,
                w_number: true,
                status: true,
                project_id: true,
            },
        });

        // Transform the data to match the required format
        const transformedLeads = leads.map((lead) => ({
            id: lead.id,
            name: lead.name,
            contact: `${lead.country_code}${lead.w_number}`,
            project_id: lead.project_id,
            status: lead.status,
        }));

        return transformedLeads;
    } catch (error) {
        logger.error('Error fetching leads:', error);
        throw error;
    }
};
