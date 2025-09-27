import { Router } from 'express';
import { verifyToken } from '@/utils/verifyToken';
import { requireTeamManagementAccess } from '@/middlewares/rbac.middleware';
import {
    createRoleGroup,
    getRoleGroups,
    getRoleGroupById,
    updateRoleGroup,
    deleteRoleGroup,
} from './role-group.controller';

const router = Router();

router.post(
    '/admin-user/role-groups',
    verifyToken,
    requireTeamManagementAccess(),
    createRoleGroup
);
router.get(
    '/admin-user/role-groups',
    verifyToken,
    requireTeamManagementAccess(),
    getRoleGroups
);
router.get(
    '/admin-user/role-groups/:id',
    verifyToken,
    requireTeamManagementAccess(),
    getRoleGroupById
);
router.put(
    '/admin-user/role-groups/:id',
    verifyToken,
    requireTeamManagementAccess(),
    updateRoleGroup
);
router.delete(
    '/admin-user/role-groups/:id',
    verifyToken,
    requireTeamManagementAccess(),
    deleteRoleGroup
);

export default router;
