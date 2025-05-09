import express from 'express';
import {
    getNotifications,
    sendCustomNotification,
  } from '../controllers/notifications.controller';  
import { adminMiddleware } from '../middlewares/admin.middleware';
import validateSchema from '../middlewares/validate.middleware';
import { NotificationSchema } from '../schema/notification.schema';

const router = express.Router();


router.get('/notifications/:broker_id', getNotifications);
router.post("/notifications/send",adminMiddleware,validateSchema(NotificationSchema),sendCustomNotification);

export default router;
