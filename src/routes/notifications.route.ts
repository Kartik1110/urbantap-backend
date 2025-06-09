import express from 'express';
import {
    getNotifications,
    sendCustomNotification,
    deleteAllNotificationsForBroker
  } from '../controllers/notifications.controller';  
  import { adminMiddleware } from '../middlewares/admin.middleware';
const router = express.Router();


router.get('/notifications/:broker_id', getNotifications);
router.post("/notifications/send",adminMiddleware, sendCustomNotification);
router.delete('/notifications/:broker_id', deleteAllNotificationsForBroker);

export default router;
