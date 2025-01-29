import { Request, Response } from 'express';
import { getNotifications } from '../services/notifications.service';
import { NotificationType } from '@prisma/client';

/*
TODO:

add auth middleware to check if the broker id requesting is indeed the logged in broker id

*/

export class NotificationsController {
  async getNotifications(req: Request, res: Response) {
    const { broker_id } = req.params;
    const { type = 'General' } = req.query;

    // Validate notification type
    if (!Object.values(NotificationType).includes(type as NotificationType)) {
      return res.status(400).json({ 
        message: `Invalid notification type. Must be one of: ${Object.values(NotificationType).join(', ')}`
      });
    }

    try {
      const notifications = await getNotifications(broker_id, type as NotificationType);
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  }
}
