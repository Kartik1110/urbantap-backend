import logger from '../../../utils/logger';
import { Response } from 'express';
import { AuthenticatedRequest } from '../../../utils/verifyToken';
import { TeamMemberService } from './team-member.service';

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
