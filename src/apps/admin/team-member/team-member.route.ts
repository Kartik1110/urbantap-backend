import { Router } from 'express';
import { verifyToken } from '../../../utils/verifyToken';
import { requireTeamManagementAccess } from '../../../middlewares/rbac.middleware';
import {
    createTeamMember,
    getTeamMembers,
    updateTeamMemberRole,
    deleteTeamMember,
    getAvailableBrokers,
} from './team-member.controller';

const router = Router();

// Team member routes (admin only)
router.post(
    '/admin-user/team-members',
    verifyToken,
    requireTeamManagementAccess(),
    createTeamMember
);
router.get(
    '/admin-user/team-members',
    verifyToken,
    requireTeamManagementAccess(),
    getTeamMembers
);
router.put(
    '/admin-user/team-members/:id/role',
    verifyToken,
    requireTeamManagementAccess(),
    updateTeamMemberRole
);
router.delete(
    '/admin-user/team-members/:id',
    verifyToken,
    requireTeamManagementAccess(),
    deleteTeamMember
);
router.get(
    '/admin-user/available-brokers',
    verifyToken,
    requireTeamManagementAccess(),
    getAvailableBrokers
);

export default router;
