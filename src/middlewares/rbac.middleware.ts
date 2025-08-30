import { Request, Response, NextFunction } from 'express';
import { Permission } from '@prisma/client';
import { PermissionChecker } from '../utils/permissions';
import { AuthenticatedRequest } from '../utils/verifyToken';

/**
 * Middleware to require specific permission
 */
export const requirePermission = (permission: Permission) => {
    return async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const adminUserId = req.user?.id;

            if (!adminUserId) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized: No user found',
                });
            }

            const hasPermission = await PermissionChecker.hasPermission(
                adminUserId,
                permission
            );

            if (!hasPermission) {
                return res.status(403).json({
                    status: 'error',
                    message: `Access denied: ${permission} permission required`,
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error during permission check',
            });
        }
    };
};

/**
 * Middleware to require resource-level access
 */
export const requireResourceAccess = (
    resourceType: 'JOB' | 'COMPANY_POST',
    action: 'CREATE' | 'EDIT' | 'DELETE' | 'VIEW',
    getResourceId?: (req: Request) => string
) => {
    return async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const adminUserId = req.user?.id;

            if (!adminUserId) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized: No user found',
                });
            }

            // For CREATE actions, just check permission
            if (action === 'CREATE') {
                const permission = `${action}_${resourceType}` as Permission;
                const hasPermission = await PermissionChecker.hasPermission(
                    adminUserId,
                    permission
                );

                if (!hasPermission) {
                    return res.status(403).json({
                        status: 'error',
                        message: `Access denied: ${permission} permission required`,
                    });
                }

                return next();
            }

            // For other actions, we need the resource ID
            const resourceId = getResourceId
                ? getResourceId(req)
                : req.params.id;

            if (!resourceId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Resource ID is required',
                });
            }

            // Validate company access first
            const hasCompanyAccess =
                await PermissionChecker.validateCompanyAccess(
                    adminUserId,
                    resourceType,
                    resourceId
                );

            if (!hasCompanyAccess) {
                return res.status(403).json({
                    status: 'error',
                    message:
                        'Access denied: Resource not found or access denied',
                });
            }

            // Check resource-level access
            const canAccess = await PermissionChecker.canAccessResource(
                adminUserId,
                resourceType,
                resourceId,
                action
            );

            if (!canAccess) {
                return res.status(403).json({
                    status: 'error',
                    message: `Access denied: Cannot ${action.toLowerCase()} this ${resourceType.toLowerCase()}`,
                });
            }

            next();
        } catch (error) {
            console.error('Resource access check error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error during access check',
            });
        }
    };
};

/**
 * Middleware to require admin-level access
 */
export const requireAdminAccess = () => {
    return async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const adminUserId = req.user?.id;

            if (!adminUserId) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized: No user found',
                });
            }

            const isAdmin = await PermissionChecker.isCompanyAdmin(adminUserId);

            if (!isAdmin) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied: Admin access required',
                });
            }

            next();
        } catch (error) {
            console.error('Admin access check error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error during admin check',
            });
        }
    };
};

/**
 * Middleware to require team member management permissions
 */
export const requireTeamManagementAccess = () => {
    return async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const adminUserId = req.user?.id;

            if (!adminUserId) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized: No user found',
                });
            }

            // Only admin users can manage team members
            const isAdmin = await PermissionChecker.isCompanyAdmin(adminUserId);

            if (!isAdmin) {
                return res.status(403).json({
                    status: 'error',
                    message:
                        'Access denied: Only admins can manage team members',
                });
            }

            next();
        } catch (error) {
            console.error('Team management access check error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error during team management check',
            });
        }
    };
};
