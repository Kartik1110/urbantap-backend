import { PrismaClient, NotificationType } from '@prisma/client';
import {
    sendPushNotification,
    sendPushNotificationToTopic,
} from './firebase.service';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export const getNotificationsService = async (
    brokerId: string,
    type: NotificationType | null | undefined
) => {
    if (type === null || type === undefined) {
        // If type is null or undefined, return all notifications for the broker
        return await prisma.notification.findMany({
            where: {
                OR: [
                    { type: NotificationType.General },
                    { type: NotificationType.Broadcast },
                ],
                broker_id: {
                    not: brokerId,
                },
            },
            orderBy: {
                timestamp: 'desc',
            },
            take: 50,
        });
    }

    if (
        type === NotificationType.Inquiries ||
        type === NotificationType.Network
    ) {
        return await prisma.notification.findMany({
            where: {
                broker_id: {
                    not: brokerId,
                },
                type: type,
            },
            orderBy: {
                timestamp: 'desc',
            },
            take: 50,
        });
    }
    // For other types, we can use a more generic query
    return await prisma.notification.findMany({
        where: {
            type: {
                equals: type,
                notIn: [NotificationType.Inquiries, NotificationType.Network],
            },
            // Always exclude own notifications
            broker_id: {
                not: brokerId,
            },
        },
        orderBy: {
            timestamp: 'desc',
        },
        take: 50,
    });
};

export const createNotificationService = async (data: {
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
        const notificationData = {
            sent_by_id: data.sent_by_id,
            broker_id: data.broker_id,
            text: data.text,
            type: data.type,
            inquiry_id: data.inquiry_id,
            connectionRequest_id: data.connectionRequest_id,
            message: data.message,
        };

        // Create notification in database
        const notification = await prisma.notification.create({
            data: notificationData,
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
                token: data.token || notification.broker?.user?.fcm_token || '',
                title: 'New Notification',
                body: data.text,
                data: {
                    id: notification.id,
                    broker_id: notification.broker_id || '', // sent_to_id
                    sent_by_id: notification.sent_by_id, // sent_by_id
                    type: notification.type,
                    timestamp: notification.timestamp.toISOString(),
                    text: notification.text || '',
                    message: notification.message || '',
                    inquiry_id: notification.inquiry_id || '',
                    connectionRequest_id:
                        notification.connectionRequest_id || '',
                },
            });
        }

        return notification;
    } catch (error) {
        logger.error('Error creating notification:', error);
        throw error;
    }
};

export const handleCustomNotification = async (body: any, senderId: string) => {
    const { token, topic, title, description, data } = body;

    // Create the notification data
    const notificationData = new Map<string, any>();
    if (data && typeof data === 'object') {
        Object.keys(data).forEach((key) => {
            notificationData.set(key, data[key]);
        });
    }

    const firebaseData = Object.fromEntries(notificationData);

    try {
        // If no token or topic is provided, return an error
        if (!token && !topic) {
            throw new Error('Either token or topic must be provided');
        }

        // Send notification to individual if token is provided
        if (token) {
            await sendPushNotification({
                token,
                title,
                body: description,
                data: firebaseData,
            });
        }
        // Send notification to topic if topic is provided
        else if (topic) {
            await sendPushNotificationToTopic({
                topic,
                title,
                body: description,
                data: firebaseData,
            });
        }

        // Save the notification to the database
        const savedNotification = await prisma.notification.create({
            data: {
                broker_id: firebaseData.broker_id || 'default_broker_id',
                text: title,
                type: firebaseData.type || 'GENERAL',
                message: description,
                sent_by_id: senderId || 'system',
                listing_id: firebaseData.listing_id || null,
                inquiry_id: firebaseData.inquiry_id || null,
                connectionRequest_id: firebaseData.connectionRequest_id || null,
            },
        });

        return savedNotification;
    } catch (error) {
        logger.error('Error handling custom notification:', error);
        throw new Error(
            `Failed to handle notification: ${(error as Error).message}`
        );
    }
};

export const deleteAllNotificationsService = async (broker_id: string) => {
    try {
        const result = await prisma.notification.deleteMany({
            where: {
                broker_id,
            },
        });

        return result.count;
    } catch (error) {
        logger.error('Error in deleteAllNotificationsService:', error);
        throw error;
    }
};
