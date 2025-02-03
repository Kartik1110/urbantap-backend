import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { getNotificationsService } from '../services/notifications.service';
import { NotificationType } from '@prisma/client';

/*
TODO:

add auth middleware to check if the broker id requesting is indeed the logged in broker id

*/

export const getNotifications = async (req: Request, res: Response) => {
  const { type = 'General' } = req.query;
  const token = req.headers.authorization;

  const decoded = jwt.verify(
    token?.replace("Bearer ", "") || "",
    process.env.JWT_SECRET!
  ) as { userId: string };


  // Validate notification type
  if (!Object.values(NotificationType).includes(type as NotificationType)) {
    return res.status(400).json({ 
      message: `Invalid notification type. Must be one of: ${Object.values(NotificationType).join(', ')}`
    });
  }

  try {
    const notifications = await getNotificationsService(decoded.userId, type as NotificationType);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};
