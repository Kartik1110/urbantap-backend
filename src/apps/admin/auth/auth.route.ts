import express from 'express';
import { verifyToken } from '@/utils/verifyToken';
import { signup, login, logout, changePassword } from './auth.controller';

const router = express.Router();

/* Auth Routes */
router.post('/admin-user/signup', signup);
router.post('/admin-user/login', login);
router.post('/admin-user/logout', verifyToken, logout);
router.post('/admin-user/change-password', verifyToken, changePassword);

export default router;
