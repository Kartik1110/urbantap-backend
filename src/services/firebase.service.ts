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
    token: string;
}

export const sendPushNotification = async (notification: PushNotificationData): Promise<void> => {
    try {
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

export const sendMulticastPushNotification = async (notifications: PushNotificationData[]): Promise<void> => {
    try {
        const message = {
            notification: {
                title: notifications[0].title,
                body: notifications[0].body,
            },
            data: notifications[0].data || {},
            tokens: notifications.map(n => n.token),
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        logger.info(`${response.successCount} messages were sent successfully`);
    } catch (error) {
        logger.error('Error sending multicast push notifications:', error);
        throw error;
    }
}; 
