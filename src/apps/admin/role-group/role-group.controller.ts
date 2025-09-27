import { Response } from 'express';
import logger from '@/utils/logger';
import { AuthenticatedRequest } from '@/utils/verifyToken';
import {
    createRoleGroupService,
    getRoleGroupsService,
    getRoleGroupByIdService,
    updateRoleGroupService,
    deleteRoleGroupService,
} from './role-group.service';

/**
 * Create role group
 */
export const createRoleGroup = async (
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

        const { name, description, permissions } = req.body;

        if (!name || !permissions || !Array.isArray(permissions)) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: name, permissions (array)',
            });
        }

        const roleGroup = await createRoleGroupService(adminUserId, {
            name,
            description,
            permissions,
        });

        res.status(201).json({
            status: 'success',
            message: 'Role group created successfully',
            data: roleGroup,
        });
    } catch (error: any) {
        logger.error('Create role group error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Failed to create role group',
        });
    }
};

/**
 * Get all role groups
 */
export const getRoleGroups = async (
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

        const roleGroups = await getRoleGroupsService(adminUserId);

        res.status(200).json({
            status: 'success',
            message: 'Role groups fetched successfully',
            data: roleGroups,
        });
    } catch (error: any) {
        logger.error('Get role groups error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Failed to get role groups',
        });
    }
};

/**
 * Get role group by ID
 */
export const getRoleGroupById = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const adminUserId = req.user?.id;
        const roleGroupId = req.params.id;

        if (!adminUserId) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized: No user found',
            });
        }

        const roleGroup = await getRoleGroupByIdService(
            adminUserId,
            roleGroupId
        );

        if (!roleGroup) {
            return res.status(404).json({
                status: 'error',
                message: 'Role group not found',
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Role group fetched successfully',
            data: roleGroup,
        });
    } catch (error: any) {
        logger.error('Get role group error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Failed to get role group',
        });
    }
};

/**
 * Update role group
 */
export const updateRoleGroup = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const adminUserId = req.user?.id;
        const roleGroupId = req.params.id;

        if (!adminUserId) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized: No user found',
            });
        }

        const { name, description, permissions } = req.body;

        const updatedRoleGroup = await updateRoleGroupService(
            adminUserId,
            roleGroupId,
            { name, description, permissions }
        );

        res.status(200).json({
            status: 'success',
            message: 'Role group updated successfully',
            data: updatedRoleGroup,
        });
    } catch (error: any) {
        logger.error('Update role group error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Failed to update role group',
        });
    }
};

/**
 * Delete role group
 */
export const deleteRoleGroup = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const adminUserId = req.user?.id;
        const roleGroupId = req.params.id;

        if (!adminUserId) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized: No user found',
            });
        }

        const result = await deleteRoleGroupService(adminUserId, roleGroupId);

        res.status(200).json({
            status: 'success',
            message: result.message,
        });
    } catch (error: any) {
        logger.error('Delete role group error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Failed to delete role group',
        });
    }
};
