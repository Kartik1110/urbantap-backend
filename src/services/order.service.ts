import prisma from '../utils/prisma';

// Get company credit usage history
export const getOrdersService = async (company_id: string) => {
    return await prisma.order.findMany({
        where: { company_id },
        orderBy: { created_at: 'desc' },
    });
};
