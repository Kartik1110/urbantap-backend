import logger from '../utils/logger';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../utils/verifyToken';
import { RoleGroupService } from '../services/role-group.service';
import { TeamMemberService } from '../services/team-member.service';
import { PermissionChecker } from '../utils/permissions';

/**
 * Create team member
 */
export const createTeamMember = async (
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

        const { brokerId, roleGroupId } = req.body;

        if (!brokerId || !roleGroupId) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: brokerId, roleGroupId',
            });
        }

        const teamMember = await TeamMemberService.createTeamMember(
            adminUserId,
            {
                brokerId,
                roleGroupId,
            }
        );

        res.status(201).json({
            status: 'success',
            message: 'Team member created successfully',
            data: teamMember,
        });
    } catch (error: any) {
        logger.error('Create team member error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Failed to create team member',
        });
    }
};

/**
 * Get all team members
 */
export const getTeamMembers = async (
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

        const teamMembers = await TeamMemberService.getTeamMembers(adminUserId);

        res.status(200).json({
            status: 'success',
            message: 'Team members fetched successfully',
            data: teamMembers,
        });
    } catch (error: any) {
        logger.error('Get team members error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Failed to get team members',
        });
    }
};

/**
 * Update team member role
 */
export const updateTeamMemberRole = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const adminUserId = req.user?.id;
        const teamMemberId = req.params.id;

        if (!adminUserId) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized: No user found',
            });
        }

        const { roleGroupId } = req.body;

        if (!roleGroupId) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required field: roleGroupId',
            });
        }

        const updatedTeamMember = await TeamMemberService.updateTeamMemberRole(
            adminUserId,
            teamMemberId,
            { roleGroupId }
        );

        res.status(200).json({
            status: 'success',
            message: 'Team member role updated successfully',
            data: updatedTeamMember,
        });
    } catch (error: any) {
        logger.error('Update team member role error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Failed to update team member role',
        });
    }
};

/**
 * Delete team member
 */
export const deleteTeamMember = async (
    req: AuthenticatedRequest,
    res: Response
) => {
    try {
        const adminUserId = req.user?.id;
        const teamMemberId = req.params.id;

        if (!adminUserId) {
            return res.status(401).json({
                status: 'error',
                message: 'Unauthorized: No user found',
            });
        }

        const result = await TeamMemberService.deleteTeamMember(
            adminUserId,
            teamMemberId
        );

        res.status(200).json({
            status: 'success',
            message: result.message,
        });
    } catch (error: any) {
        logger.error('Delete team member error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Failed to delete team member',
        });
    }
};

/**
 * Get available brokers for team assignment
 */
export const getAvailableBrokers = async (
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

        const brokers =
            await TeamMemberService.getAvailableBrokers(adminUserId);

        res.status(200).json({
            status: 'success',
            message: 'Available brokers fetched successfully',
            data: brokers,
        });
    } catch (error: any) {
        logger.error('Get available brokers error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message || 'Failed to get available brokers',
        });
    }
};

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

        const roleGroup = await RoleGroupService.createRoleGroup(adminUserId, {
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

        const roleGroups = await RoleGroupService.getRoleGroups(adminUserId);

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

        const roleGroup = await RoleGroupService.getRoleGroupById(
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

        const updatedRoleGroup = await RoleGroupService.updateRoleGroup(
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

        const result = await RoleGroupService.deleteRoleGroup(
            adminUserId,
            roleGroupId
        );

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

/**
 * Get available permissions
 */
export const getAvailablePermissions = async (req: Request, res: Response) => {
    try {
        const permissions = await RoleGroupService.getAvailablePermissions();

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

/**
 * Get current user permissions
 */
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
            await PermissionChecker.getUserPermissions(adminUserId);

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
