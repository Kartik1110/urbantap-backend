import * as admin from 'firebase-admin';
import logger from '../utils/logger';

const serviceAccount = require('../config/urbantap-firebase.json');

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

export const sendPushNotification = async (notification: PushNotificationData): Promise<void> => {
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
        logger.info(`Push notification sent successfully to token: ${notification.token}`);
    } catch (error) {
        logger.error('Error sending push notification:', error);
        throw error;
    }
};

export const sendPushNotificationToTopic = async (notification: PushNotificationData): Promise<void> => {
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
        logger.info(`Push notification sent successfully to topic: ${notification.topic}`);
    } catch (error) {
        logger.error('Error sending push notification:', error);
        throw error;
    }
};

export const sendMulticastPushNotification = async (notifications: PushNotificationData[]): Promise<void> => {
    try {
        const validTokens = notifications.map(n => n.token).filter((token): token is string => !!token);
        
        if (validTokens.length === 0) {
            throw new Error('At least one valid token is required');
        }

        const message = {
            notification: {
                title: notifications[0].title,
                body: notifications[0].body,
            },
            data: notifications[0].data || {},
            tokens: validTokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        logger.info(`${response.successCount} messages were sent successfully`);
    } catch (error) {
        logger.error('Error sending multicast push notifications:', error);
        throw error;
    }
}; 
