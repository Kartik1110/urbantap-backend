import { z } from 'zod';
import logger from '@/utils/logger';
import prisma from '@/utils/prisma';
import {
    getNotificationsService,
    handleCustomNotification,
    deleteAllNotificationsService,
} from './notification.service';
import { Request, Response } from 'express';
import { NotificationType } from '@prisma/client';

const NotificationSchema = z
    .object({
        token: z.string().optional(),
        topic: z.string().optional(),
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(1, 'Description is required'),
        data: z
            .object({
                broker_id: z.string().optional(),
                type: z.nativeEnum(NotificationType).optional(),
                listing_id: z.string().nullable().optional(),
                inquiry_id: z.string().nullable().optional(),
                connectionRequest_id: z.string().nullable().optional(),
            })
            .optional(),
    })
    .refine((body) => body.token || body.topic, {
        message: 'Either token or topic must be provided',
        path: ['token', 'topic'],
    });

/*
TODO:

add auth middleware to check if the broker id requesting is indeed the logged in broker id

*/

export const getNotifications = async (req: Request, res: Response) => {
    const { type } = req.query;
    const { broker_id } = req.params;

    // Validate notification type
    if (
        !Object.values(NotificationType).includes(type as NotificationType) &&
        type !== undefined
    ) {
        return res.status(400).json({
            message: `Invalid notification type. Must be one of: ${Object.values(NotificationType).join(', ')} or undefined`,
        });
    }

    // Validating Broker ID
    if (!broker_id) {
        return res.status(400).json({ message: 'Broker ID is required' });
    }

    // Check if broker exists
    const broker = await prisma.broker.findUnique({
        where: { id: broker_id },
    });

    if (!broker) {
        return res.status(404).json({ message: 'Broker not found' });
    }

    try {
        const notifications = await getNotificationsService(
            broker_id,
            type as NotificationType | undefined
        );
        res.status(200).json(notifications);
    } catch (error) {
        logger.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

export const sendCustomNotification = async (req: Request, res: Response) => {
    try {
        const parsedBody = NotificationSchema.parse(req.body);
        const userId = (req as any).user?.id;
        const result = await handleCustomNotification(parsedBody, userId);
        return res.status(200).json({
            message: 'Notification sent and saved',
            savedNotification: result,
        });
    } catch (error) {
        logger.error('Error sending notification:', error);
        return res.status(500).json({
            message: 'Failed to send or save notification',
            error: (error as Error).message,
        });
    }
};

export const deleteAllNotificationsForBroker = async (
    req: Request,
    res: Response
) => {
    try {
        const broker_id = req.params.broker_id;

        if (!broker_id) {
            return res.status(400).json({ message: 'Broker ID is required' });
        }

        const deletedCount = await deleteAllNotificationsService(broker_id);

        return res.status(200).json({
            message: `Deleted ${deletedCount} notifications for broker ${broker_id}`,
        });
    } catch (error) {
        logger.error('Error deleting notifications:', error);
        return res.status(500).json({
            message: 'Failed to delete notifications',
            error: (error as Error).message,
        });
    }
};
