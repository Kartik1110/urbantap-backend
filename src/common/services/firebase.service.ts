import logger from '@/utils/logger';
import * as admin from 'firebase-admin';

const serviceAccount = require('../../config/urbantap-firebase.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export interface PushNotificationData {
    title: string;
    body: string;
    data?: Record<string, string>;
    token?: string;
    topic?: string;
}

export const sendPushNotification = async (
    notification: PushNotificationData
): Promise<void> => {
    try {
        if (!notification.token) {
            throw new Error('Token is required');
        }

        const message = {
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: notification.data || {},
            token: notification.token,
        };

        await admin.messaging().send(message);
        logger.info(
            `Push notification sent successfully to token: ${notification.token}`
        );
    } catch (error) {
        logger.error('Error sending push notification:', error);
        throw error;
    }
};

export const sendPushNotificationToTopic = async (
    notification: PushNotificationData
): Promise<void> => {
    try {
        if (!notification.topic) {
            throw new Error('Topic is required');
        }

        const message = {
            notification: {
                title: notification.title,
                body: notification.body,
            },
            data: notification.data || {},
            topic: notification.topic,
        };

        await admin.messaging().send(message);
        logger.info(
            `Push notification sent successfully to topic: ${notification.topic}`
        );
    } catch (error) {
        logger.error('Error sending push notification:', error);
        throw error;
    }
};

export const sendMulticastPushNotification = async (
    notifications: PushNotificationData[]
): Promise<void> => {
    try {
        const validTokens = notifications
            .map((n) => n.token)
            .filter((token): token is string => !!token);

        if (validTokens.length === 0) {
            throw new Error('At least one valid token is required');
        }

        const BATCH_SIZE = 400;
        for (let i = 0; i < validTokens.length; i += BATCH_SIZE) {
            const batchTokens = validTokens.slice(i, i + BATCH_SIZE);

            const message = {
                notification: {
                    title: notifications[0].title,
                    body: notifications[0].body,
                },
                data: notifications[0].data || {},
                tokens: batchTokens,
            };

            const response = await admin
                .messaging()
                .sendEachForMulticast(message);

            logger.info(
                `Multicast batch ${Math.floor(i / BATCH_SIZE) + 1}: ${response.successCount} succeeded, ${response.failureCount} failed`
            );

            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    logger.error(
                        `Failed to send to token: ${batchTokens[idx]} - ${resp.error?.message}`
                    );
                }
            });
        }
    } catch (error) {
        logger.error('Error sending multicast push notifications:', error);
        throw error;
    }
};
