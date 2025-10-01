import { Router } from 'express';
import { verifyToken } from '../../../utils/verifyToken';
import { getAvailablePermissions, getUserPermissions } from './permission.controller';

const router = Router();

// Permission routes
router.get('/admin-user/permissions', verifyToken, getAvailablePermissions);
router.get('/admin-user/user-permissions', verifyToken, getUserPermissions);

export default router;
