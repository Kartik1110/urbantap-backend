import { Router } from 'express';
import { getOrders } from '../controllers/order.controller';
import { verifyToken } from '../utils/verifyToken';

const router = Router();

router.get('/admin-user/orders', verifyToken, getOrders);

export default router;
