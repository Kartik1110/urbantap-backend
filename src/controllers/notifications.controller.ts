import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { getNotificationsService,handleCustomNotification } from '../services/notifications.service';
import { NotificationType } from '@prisma/client';

/*
TODO:

add auth middleware to check if the broker id requesting is indeed the logged in broker id

*/

export const getNotifications = async (req: Request, res: Response) => {
  const { type = 'General' } = req.query;
  const { broker_id } = req.params;

  // Validate notification type
  if (!Object.values(NotificationType).includes(type as NotificationType)) {
    return res.status(400).json({ 
      message: `Invalid notification type. Must be one of: ${Object.values(NotificationType).join(', ')}`
    });
  }

  try {
    const notifications = await getNotificationsService(broker_id, type as NotificationType);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

export const sendCustomNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const result = await handleCustomNotification(req.body, userId);
    return res.status(200).json({
      message: "Notification sent and saved",
      savedNotification: result,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({
      message: "Failed to send or save notification",
      error: (error as Error).message,
    });
  }
};