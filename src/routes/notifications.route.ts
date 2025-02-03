import express from 'express';
import { getNotifications } from '../controllers/notifications.controller';

const router = express.Router();

router.get('/notifications/:broker_id', getNotifications);

export default router;
