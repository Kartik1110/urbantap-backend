import logger from '@/utils/logger';
import { Request, Response } from 'express';
import { PermissionService } from './permission.service';
import { AuthenticatedRequest } from '@/utils/verifyToken';

export const getAvailablePermissions = async (req: Request, res: Response) => {
    try {
        const permissions = await PermissionService.getAvailablePermissions();

        res.status(200).json({
            status: 'success',
            message: 'Available permissions fetched successfully',
            data: permissions,
        });
    } catch (error: any) {
        logger.error('Get available permissions error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to get available permissions',
        });
    }
};

export const getUserPermissions = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const adminUserId = req.user?.id;

        if (!adminUserId) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized: No user found',
            });
        }

        const permissions =
            await PermissionService.getUserPermissions(adminUserId);

        res.status(200).json({
            status: 'success',
            message: 'User permissions fetched successfully',
            data: permissions,
        });
    } catch (error: any) {
        logger.error('Get user permissions error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to get user permissions',
        });
    }
};
