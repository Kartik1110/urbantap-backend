import express from 'express';
import {
    getNotifications,
    sendCustomNotification,
  } from '../controllers/notifications.controller';  
const router = express.Router();

router.get('/notifications/:broker_id', getNotifications);
router.post("/notifications/send", sendCustomNotification);

export default router;
