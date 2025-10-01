import prisma from '@/utils/prisma';

export class BrokerService {
    /**
     * Get brokers for a company (excluding those already assigned as team members)
     */
    static async getBrokers(companyId: string) {
        // Get all broker IDs that are already admin users (team members) for this company
        const adminUserBrokers = await prisma.adminUser.findMany({
            where: {
                company_id: companyId,
                broker_id: { not: null },
            },
            select: { broker_id: true },
        });

        const brokerIdsInAdminUser = adminUserBrokers
            .map((au) => au.broker_id)
            .filter((id): id is string => !!id);

        // Return brokers who are NOT in adminUser as a member
        return await prisma.broker.findMany({
            where: {
                company_id: companyId,
                id: { notIn: brokerIdsInAdminUser },
            },
        });
    }
}
