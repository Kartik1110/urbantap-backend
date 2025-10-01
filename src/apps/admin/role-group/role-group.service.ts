import prisma from '@/utils/prisma';
import logger from '@/utils/logger';
import { Permission, AdminUserType } from '@prisma/client';

export interface CreateRoleGroupDTO {
    name: string;
    description?: string;
    permissions: Permission[];
}

export interface UpdateRoleGroupDTO {
    name?: string;
    description?: string;
    permissions?: Permission[];
}

/**
 * Create new role group
 */
export const createRoleGroupService = async (
    adminUserId: string,
    roleGroupData: CreateRoleGroupDTO
) => {
    try {
        const adminUser = await prisma.adminUser.findUnique({
            where: { id: adminUserId },
            select: { type: true },
        });

        if (!adminUser || adminUser.type !== AdminUserType.ADMIN) {
            throw new Error('Only admin users can create role groups');
        }

        return await prisma.roleGroup.create({
            data: {
                name: roleGroupData.name,
                description: roleGroupData.description,
                permissions: roleGroupData.permissions,
            },
        });
    } catch (error) {
        logger.error('Error creating role group:', error);
        throw error;
    }
};

/**
 * Get all role groups
 */
export const getRoleGroupsService = async (adminUserId: string) => {
    try {
        const adminUser = await prisma.adminUser.findUnique({
            where: { id: adminUserId },
            select: { type: true },
        });

        if (!adminUser || adminUser.type !== AdminUserType.ADMIN) {
            throw new Error('Only admin users can view role groups');
        }

        return await prisma.roleGroup.findMany({
            include: {
                _count: {
                    select: {
                        admin_users: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    } catch (error) {
        logger.error('Error getting role groups:', error);
        throw error;
    }
};

/**
 * Get role group by ID
 */
export const getRoleGroupByIdService = async (
    adminUserId: string,
    roleGroupId: string
) => {
    try {
        const adminUser = await prisma.adminUser.findUnique({
            where: { id: adminUserId },
            select: { type: true },
        });

        if (!adminUser || adminUser.type !== AdminUserType.ADMIN) {
            throw new Error('Only admin users can view role groups');
        }

        return await prisma.roleGroup.findUnique({
            where: { id: roleGroupId },
            include: {
                admin_users: {
                    select: {
                        id: true,
                        email: true,
                        broker: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    } catch (error) {
        logger.error('Error getting role group:', error);
        throw error;
    }
};

/**
 * Update role group
 */
export const updateRoleGroupService = async (
    adminUserId: string,
    roleGroupId: string,
    updateData: UpdateRoleGroupDTO
) => {
    try {
        const adminUser = await prisma.adminUser.findUnique({
            where: { id: adminUserId },
            select: { type: true },
        });

        if (!adminUser || adminUser.type !== AdminUserType.ADMIN) {
            throw new Error('Only admin users can update role groups');
        }

        const roleGroup = await prisma.roleGroup.findUnique({
            where: { id: roleGroupId },
        });

        if (!roleGroup) {
            throw new Error('Role group not found');
        }

        return await prisma.roleGroup.update({
            where: { id: roleGroupId },
            data: {
                ...(updateData.name && { name: updateData.name }),
                ...(updateData.description !== undefined && {
                    description: updateData.description,
                }),
                ...(updateData.permissions && {
                    permissions: updateData.permissions,
                }),
            },
        });
    } catch (error) {
        logger.error('Error updating role group:', error);
        throw error;
    }
};

/**
 * Delete role group
 */
export const deleteRoleGroupService = async (
    adminUserId: string,
    roleGroupId: string
) => {
    try {
        const adminUser = await prisma.adminUser.findUnique({
            where: { id: adminUserId },
            select: { type: true },
        });

        if (!adminUser || adminUser.type !== AdminUserType.ADMIN) {
            throw new Error('Only admin users can delete role groups');
        }

        const roleGroup = await prisma.roleGroup.findUnique({
            where: { id: roleGroupId },
            include: {
                _count: {
                    select: {
                        admin_users: true,
                    },
                },
            },
        });

        if (!roleGroup) {
            throw new Error('Role group not found');
        }

        if (roleGroup._count.admin_users > 0) {
            throw new Error('Cannot delete role group that has assigned users');
        }

        await prisma.roleGroup.delete({
            where: { id: roleGroupId },
        });

        return {
            success: true,
            message: 'Role group deleted successfully',
        };
    } catch (error) {
        logger.error('Error deleting role group:', error);
        throw error;
    }
};

/**
 * Get available permissions
 */
export const getAvailablePermissionsService = async () => {
    return Object.values(Permission);
};
