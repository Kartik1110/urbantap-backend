import { PrismaClient, NotificationType, Prisma } from "@prisma/client";
import { sendPushNotification } from "./firebase.service";
import logger from "../utils/logger";

const prisma = new PrismaClient();

export const getNotifications = async (
  brokerId: string,
  type: NotificationType
) => {
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
    orderBy: { timestamp: "desc" },
  });
};

export const createNotification = async (data: {
  token?: string;
  sent_by_id: string;
  broker_id: string;
  text: string;
  type: NotificationType;
  inquiry_id?: string;
  connectionRequest_id?: string;
  message?: string;
}) => {
  try {
    // Create notification in database
    const notification = await prisma.notification.create({
      data,
      include: {
        broker: {
          include: {
            user: true,
          },
        },
      },
    });

    // Send push notification if user has FCM token
    if (data.token || notification.broker?.user?.fcm_token) {
      await sendPushNotification({
        token: data.token || notification.broker?.user?.fcm_token || "",
        title: "New Notification",
        body: data.text,
        data: {
          id: notification.id,
          broker_id: notification.broker_id, // sent_to_id
          sent_by_id: notification.sent_by_id, // sent_by_id
          type: notification.type,
          timestamp: notification.timestamp.toISOString(),
          text: notification.text || "",
          message: notification.message || "",
          inquiry_id: notification.inquiry_id || "",
          connectionRequest_id: notification.connectionRequest_id || "",
        },
      });
    }

    return notification;
  } catch (error) {
    logger.error("Error creating notification:", error);
    throw error;
  }
};
