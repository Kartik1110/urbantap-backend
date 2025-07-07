import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const getBrokeragesService = async ({
    page,
    pageSize,
    search,
}: {
    page: number;
    pageSize: number;
    search?: string;
}) => {
    try {
        const skip = (page - 1) * pageSize;

        const whereClause = search
            ? {
                  name: {
                      contains: search,
                      mode: 'insensitive' as Prisma.QueryMode, // consistent with Developer service
                  },
              }
            : {};

        const [brokeragesRaw, totalCount] = await Promise.all([
            prisma.brokerage.findMany({
                where: whereClause,
                skip,
                take: pageSize,
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    brokers: {
                        select: { id: true },
                    },
                },
            }),
            prisma.brokerage.count({ where: whereClause }),
        ]);

        const brokerages = brokeragesRaw.map((brokerage) => ({
            id: brokerage.id,
            name: brokerage.name,
            logo: brokerage.logo,
            broker_count: brokerage.brokers.length,
        }));

        const pagination = {
            page,
            pageSize,
            total: totalCount,
            totalPages: Math.ceil(totalCount / pageSize),
        };

        return { brokerages, pagination };
    } catch (error) {
        throw error;
    }
};

export const createBrokerageService = async (data: {
    name: string;
    logo: string;
    description: string;
    ded?: string;
    rera?: string;
    contact_email?: string;
    contact_phone?: string;
    service_areas: string[];
    company_id: string;
}) => {
    try {
        return await prisma.brokerage.create({
            data,
        });
    } catch (error) {
        throw error;
    }
};

export const getBrokerageDetailsService = async (brokerageId: string) => {
    try {
        const brokerage = await prisma.brokerage.findUnique({
            where: { id: brokerageId },
            include: {
                brokers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        w_number: true,
                    },
                },
                company: true,
            },
        });

        if (!brokerage) throw new Error('Brokerage not found');

        // You can derive listings through brokers if needed
        const brokerIds = brokerage.brokers.map((b) => b.id);

        const listings = await prisma.listing.findMany({
            where: {
                broker_id: { in: brokerIds },
            },
            select: {
                id: true,
                title: true,
                min_price: true,
                max_price: true,
                image: true,
            },
        });

        return {
            id: brokerage.id,
            name: brokerage.name,
            logo: brokerage.logo,
            description: brokerage.description,
            ded: brokerage.ded,
            rera: brokerage.rera,
            contact: {
                email: brokerage.contact_email,
                phone: brokerage.contact_phone,
            },
            service_areas: brokerage.service_areas,
            broker_count: brokerage.brokers.length,
            brokers: brokerage.brokers,
            listings: listings,
            company: {
                id: brokerage.company.id,
                name: brokerage.company.name,
                type: brokerage.company.type,
            },
        };
    } catch (error) {
        throw error;
    }
};
