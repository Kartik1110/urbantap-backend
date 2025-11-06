import logger from '@/utils/logger';
import prisma from '@/utils/prisma';
import { NotificationType } from '@prisma/client';
import { sendPushNotification } from './firebase.service';

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
