import express from 'express';
import {
    getNotifications,
    sendCustomNotification,
  } from './notifications.controller';  
  import { adminMiddleware } from '../../middlewares/admin.middleware';
const router = express.Router();


router.get('/notifications/:broker_id', getNotifications);
router.post("/notifications/send",adminMiddleware, sendCustomNotification);

export default router;
