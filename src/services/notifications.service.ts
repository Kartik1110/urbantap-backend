import { PrismaClient, NotificationType, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationsService {
  async getNotifications(brokerId: string, type: NotificationType) {
    let whereClause: Prisma.NotificationWhereInput = { broker_id: brokerId };

    // Determine the type filter
    if (type === NotificationType.Network) {
      whereClause.type = NotificationType.Network;
    } else if (type === NotificationType.Inquiries) {
      whereClause.type = NotificationType.Inquiries;
    }

    // Fetch notifications based on the broker ID and type
    return await prisma.notification.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
    });
  }
}
