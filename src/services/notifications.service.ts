import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationsService {
  async getNotifications(brokerId: string, type: string) {
    let whereClause: any = { broker_id: brokerId };

    // Determine the type filter
    if (type === 'network') {
      whereClause.type = NotificationType.Network;
    } else if (type === 'enquiries') {
      whereClause.type = NotificationType.Enquiries;
    }

    // Fetch notifications based on the broker ID and type
    return await prisma.notification.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
    });
  }
}
