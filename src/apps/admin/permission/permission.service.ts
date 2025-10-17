import { RoleGroupService } from '../../../services/role-group.service';
import { PermissionChecker } from '@/utils/permissions';

export class PermissionService {
    /**
     * Get all available permissions
     */
    static async getAvailablePermissions() {
        return await RoleGroupService.getAvailablePermissions();
    }

    /**
     * Get user permissions
     */
    static async getUserPermissions(adminUserId: string) {
        return await PermissionChecker.getUserPermissions(adminUserId);
    }
}
