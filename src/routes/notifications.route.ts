import express from 'express';
import { NotificationsController } from '../controllers/notifications.controller';

const router = express.Router();
const notificationsController = new NotificationsController();

// Define the route with broker_id parameter and type query parameter
router.get('/notifications/:broker_id', (req, res) => notificationsController.getNotifications(req, res));

export default router;
