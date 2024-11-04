import { Request, Response } from 'express';
import { NotificationsService } from '../services/notifications.service';

const notificationsService = new NotificationsService();

/*
TODO:

add auth middleware to check if the broker id requesting is indeed the logged in broker id

*/

export class NotificationsController {
  async getNotifications(req: Request, res: Response) {
    const { broker_id } = req.params;
    const { type = 'all' } = req.query;

    try {
      const notifications = await notificationsService.getNotifications(broker_id, type as string);
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  }
}
