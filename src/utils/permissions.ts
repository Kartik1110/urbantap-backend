import { Permission, AdminUserType } from '@prisma/client';
import prisma from './prisma';
import logger from './logger';

export class PermissionChecker {
    /**
     * Check if admin user has specific permission
     */
    static async hasPermission(
        adminUserId: string,
        permission: Permission
    ): Promise<boolean> {
        try {
            const adminUser = await prisma.adminUser.findUnique({
                where: { id: adminUserId },
                include: {
                    role_group: {
                        select: {
                            permissions: true,
                        },
                    },
                },
            });

            if (!adminUser) {
                return false;
            }

            // Admin users have all permissions
            if (adminUser.type === AdminUserType.ADMIN) {
                return true;
            }

            // Check if user has the specific permission through role group
            if (adminUser.role_group) {
                return adminUser.role_group.permissions.includes(permission);
            }

            return false;
        } catch (error) {
            logger.error('Error checking permission:', error);
            return false;
        }
    }

    /**
     * Check if admin user can access specific resource
     */
    static async canAccessResource(
        adminUserId: string,
        resourceType: 'JOB' | 'COMPANY_POST',
        resourceId: string,
        action: 'CREATE' | 'EDIT' | 'DELETE' | 'VIEW'
    ): Promise<boolean> {
        try {
            const adminUser = await prisma.adminUser.findUnique({
                where: { id: adminUserId },
                include: {
                    role_group: {
                        select: {
                            permissions: true,
                        },
                    },
                },
            });

            if (!adminUser) {
                return false;
            }

            // Admin users have full access
            if (adminUser.type === AdminUserType.ADMIN) {
                return true;
            }

            // Build permission name based on resource type and action
            const permissionName = `${action}_${resourceType}` as Permission;

            // Check if user has the required permission
            if (
                !adminUser.role_group ||
                !adminUser.role_group.permissions.includes(permissionName)
            ) {
                return false;
            }

            // For VIEW actions, just having the permission is enough
            if (action === 'VIEW') {
                return true;
            }

            // For CREATE actions, just having the permission is enough
            if (action === 'CREATE') {
                return true;
            }

            // For EDIT and DELETE actions, check ownership
            if (action === 'EDIT' || action === 'DELETE') {
                return await this.isResourceOwner(
                    adminUserId,
                    resourceType,
                    resourceId
                );
            }

            return false;
        } catch (error) {
            logger.error('Error checking resource access:', error);
            return false;
        }
    }

    /**
     * Check if admin user owns the resource
     */
    static async isResourceOwner(
        adminUserId: string,
        resourceType: 'JOB' | 'COMPANY_POST',
        resourceId: string
    ): Promise<boolean> {
        try {
            if (resourceType === 'JOB') {
                const job = await prisma.job.findUnique({
                    where: { id: resourceId },
                    select: { admin_user_id: true },
                });
                return job?.admin_user_id === adminUserId;
            } else if (resourceType === 'COMPANY_POST') {
                const companyPost = await prisma.companyPost.findUnique({
                    where: { id: resourceId },
                    select: { admin_user_id: true },
                });
                return companyPost?.admin_user_id === adminUserId;
            }
            return false;
        } catch (error) {
            logger.error('Error checking resource ownership:', error);
            return false;
        }
    }

    /**
     * Get all permissions for admin user
     */
    static async getUserPermissions(
        adminUserId: string
    ): Promise<Permission[]> {
        try {
            const adminUser = await prisma.adminUser.findUnique({
                where: { id: adminUserId },
                include: {
                    role_group: {
                        select: {
                            permissions: true,
                        },
                    },
                },
            });

            if (!adminUser) {
                return [];
            }

            // Admin users have all permissions
            if (adminUser.type === AdminUserType.ADMIN) {
                return Object.values(Permission);
            }

            return adminUser.role_group?.permissions || [];
        } catch (error) {
            logger.error('Error getting user permissions:', error);
            return [];
        }
    }

    /**
     * Check if admin user is admin of company
     */
    static async isCompanyAdmin(adminUserId: string): Promise<boolean> {
        try {
            const adminUser = await prisma.adminUser.findUnique({
                where: { id: adminUserId },
                select: { type: true },
            });

            return adminUser?.type === AdminUserType.ADMIN;
        } catch (error) {
            logger.error('Error checking company admin status:', error);
            return false;
        }
    }

    /**
     * Validate admin user belongs to same company as resource
     */
    static async validateCompanyAccess(
        adminUserId: string,
        resourceType: 'JOB' | 'COMPANY_POST',
        resourceId: string
    ): Promise<boolean> {
        try {
            const adminUser = await prisma.adminUser.findUnique({
                where: { id: adminUserId },
                select: { company_id: true },
            });

            if (!adminUser) {
                return false;
            }

            if (resourceType === 'JOB') {
                const job = await prisma.job.findUnique({
                    where: { id: resourceId },
                    select: { company_id: true },
                });
                return job?.company_id === adminUser.company_id;
            } else if (resourceType === 'COMPANY_POST') {
                const companyPost = await prisma.companyPost.findUnique({
                    where: { id: resourceId },
                    select: { company_id: true },
                });
                return companyPost?.company_id === adminUser.company_id;
            }

            return false;
        } catch (error) {
            logger.error('Error validating company access:', error);
            return false;
        }
    }

    /**
     * Get filtered jobs based on user permissions
     */
    static async getAccessibleJobs(adminUserId: string) {
        try {
            const adminUser = await prisma.adminUser.findUnique({
                where: { id: adminUserId },
                include: {
                    role_group: {
                        select: {
                            permissions: true,
                        },
                    },
                },
            });

            if (!adminUser) {
                return [];
            }

            // Admin users see all company jobs
            if (adminUser.type === AdminUserType.ADMIN) {
                return await prisma.job.findMany({
                    where: { company_id: adminUser.company_id },
                    orderBy: { created_at: 'desc' },
                });
            }

            // Members see only their own jobs (individual level)
            return await prisma.job.findMany({
                where: {
                    company_id: adminUser.company_id,
                    admin_user_id: adminUserId,
                },
                orderBy: { created_at: 'desc' },
            });
        } catch (error) {
            logger.error('Error getting accessible jobs:', error);
            return [];
        }
    }

    /**
     * Get filtered company posts based on user permissions
     */
    static async getAccessibleCompanyPosts(adminUserId: string) {
        try {
            const adminUser = await prisma.adminUser.findUnique({
                where: { id: adminUserId },
                include: {
                    role_group: {
                        select: {
                            permissions: true,
                        },
                    },
                },
            });

            if (!adminUser) {
                return [];
            }

            // Admin users see all company posts
            if (adminUser.type === AdminUserType.ADMIN) {
                return await prisma.companyPost.findMany({
                    where: { company_id: adminUser.company_id },
                    orderBy: { created_at: 'desc' },
                });
            }

            // Members see only their own posts (individual level)
            return await prisma.companyPost.findMany({
                where: {
                    company_id: adminUser.company_id,
                    admin_user_id: adminUserId,
                },
                orderBy: { created_at: 'desc' },
            });
        } catch (error) {
            logger.error('Error getting accessible company posts:', error);
            return [];
        }
    }

    /**
     * Check if user can view specific job
     */
    static async canViewJob(
        adminUserId: string,
        jobId: string
    ): Promise<boolean> {
        try {
            const adminUser = await prisma.adminUser.findUnique({
                where: { id: adminUserId },
                select: { type: true, company_id: true },
            });

            if (!adminUser) {
                return false;
            }

            const job = await prisma.job.findUnique({
                where: { id: jobId },
                select: { admin_user_id: true, company_id: true },
            });

            if (!job || job.company_id !== adminUser.company_id) {
                return false;
            }

            // Admin users can view all company jobs
            if (adminUser.type === AdminUserType.ADMIN) {
                return true;
            }

            // Members can only view their own jobs
            return job.admin_user_id === adminUserId;
        } catch (error) {
            logger.error('Error checking job view access:', error);
            return false;
        }
    }

    /**
     * Check if user can view specific company post
     */
    static async canViewCompanyPost(
        adminUserId: string,
        postId: string
    ): Promise<boolean> {
        try {
            const adminUser = await prisma.adminUser.findUnique({
                where: { id: adminUserId },
                select: { type: true, company_id: true },
            });

            if (!adminUser) {
                return false;
            }

            const companyPost = await prisma.companyPost.findUnique({
                where: { id: postId },
                select: { admin_user_id: true, company_id: true },
            });

            if (
                !companyPost ||
                companyPost.company_id !== adminUser.company_id
            ) {
                return false;
            }

            // Admin users can view all company posts
            if (adminUser.type === AdminUserType.ADMIN) {
                return true;
            }

            // Members can only view their own posts
            return companyPost.admin_user_id === adminUserId;
        } catch (error) {
            logger.error('Error checking company post view access:', error);
            return false;
        }
    }

    /**
     * Get filtered projects based on user permissions
     */
    static async getAccessibleProjects(adminUserId: string) {
        try {
            const adminUser = await prisma.adminUser.findUnique({
                where: { id: adminUserId },
                include: {
                    role_group: {
                        select: {
                            permissions: true,
                        },
                    },
                },
            });

            if (!adminUser) {
                return [];
            }

            // Get the developer associated with the admin user's company
            const developer = await prisma.developer.findFirst({
                where: { company_id: adminUser.company_id },
            });

            if (!developer) {
                return [];
            }

            // Admin users see all company projects
            if (adminUser.type === AdminUserType.ADMIN) {
                return await prisma.project.findMany({
                    where: { developer_id: developer.id },
                    include: {
                        floor_plans: true,
                        inventory: true,
                        admin_user: {
                            include: { broker: true },
                        },
                        developer: {
                            select: {
                                id: true,
                                company: {
                                    select: {
                                        name: true,
                                        logo: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: { created_at: 'desc' },
                });
            }

            // Members see only their own projects (individual level)
            return await prisma.project.findMany({
                where: {
                    developer_id: developer.id,
                    admin_user_id: adminUserId,
                },
                include: {
                    floor_plans: true,
                    inventory: true,
                    admin_user: {
                        include: { broker: true },
                    },
                    developer: {
                        select: {
                            id: true,
                            company: {
                                select: {
                                    name: true,
                                    logo: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
            });
        } catch (error) {
            logger.error('Error getting accessible projects:', error);
            return [];
        }
    }

    /**
     * Check if user can view specific project
     */
    static async canViewProject(
        adminUserId: string,
        projectId: string
    ): Promise<boolean> {
        try {
            const adminUser = await prisma.adminUser.findUnique({
                where: { id: adminUserId },
                select: { type: true, company_id: true },
            });

            if (!adminUser) {
                return false;
            }

            const project = await prisma.project.findUnique({
                where: { id: projectId },
                select: {
                    admin_user_id: true,
                    developer: {
                        select: { company_id: true },
                    },
                },
            });

            if (
                !project ||
                project.developer.company_id !== adminUser.company_id
            ) {
                return false;
            }

            // Admin users can view all company projects
            if (adminUser.type === AdminUserType.ADMIN) {
                return true;
            }

            // Members can only view their own projects
            return project.admin_user_id === adminUserId;
        } catch (error) {
            logger.error('Error checking project view access:', error);
            return false;
        }
    }
}
