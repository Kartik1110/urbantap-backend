import prisma from '@/utils/prisma';
import { Prisma } from '@prisma/client';
import { PermissionChecker } from '@/utils/permissions';

interface FloorPlanData {
    title: string;
    min_price?: number;
    max_price?: number;
    unit_size?: number;
    bedrooms: string;
    bathrooms: string;
    image_urls: string[];
}

interface ProjectCreateData
    extends Omit<Prisma.ProjectCreateInput, 'floor_plans' | 'inventory'> {
    floor_plans?: FloorPlanData[];
    inventory_files?: string[];
    admin_user_id?: string;
}

export const createProjectService = async (data: ProjectCreateData) => {
    const { floor_plans, inventory_files, admin_user_id, ...projectData } =
        data;

    const project = await prisma.project.create({
        data: {
            ...projectData,
            admin_user: admin_user_id
                ? {
                      connect: {
                          id: admin_user_id,
                      },
                  }
                : undefined,
            floor_plans: floor_plans
                ? {
                      create: floor_plans.map((fp) => ({
                          title: fp.title,
                          min_price: fp.min_price,
                          max_price: fp.max_price,
                          unit_size: fp.unit_size,
                          bedrooms:
                              fp.bedrooms as Prisma.FloorPlanCreateInput['bedrooms'],
                          bathrooms:
                              fp.bathrooms as Prisma.FloorPlanCreateInput['bathrooms'],
                          image_urls: fp.image_urls,
                      })),
                  }
                : undefined,
            inventory: inventory_files
                ? {
                      create: inventory_files.map((file_url) => ({
                          file_url,
                      })),
                  }
                : undefined,
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
    });

    return project;
};

export const getProjectsService = async (developerId: string) => {
    return await prisma.project.findMany({
        where: { developer_id: developerId },
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
        orderBy: {
            created_at: 'desc',
        },
    });
};

export const updateProjectService = async (
    projectId: string,
    data: ProjectCreateData
) => {
    const { floor_plans, inventory_files, admin_user_id, ...projectData } =
        data;

    // Delete existing floor plans if updating (floor plans are replaced)
    await prisma.floorPlan.deleteMany({
        where: { project_id: projectId },
    });

    // For inventory: ADD new files instead of replacing existing ones
    // Only add new inventory files if provided
    if (inventory_files && inventory_files.length > 0) {
        await prisma.inventory.createMany({
            data: inventory_files.map((file_url: string) => ({
                file_url,
                project_id: projectId,
            })),
        });
    }

    const project = await prisma.project.update({
        where: { id: projectId },
        data: {
            ...projectData,
            admin_user: admin_user_id
                ? {
                      connect: {
                          id: admin_user_id,
                      },
                  }
                : undefined,
            floor_plans:
                floor_plans && floor_plans.length > 0
                    ? {
                          create: floor_plans.map((fp: FloorPlanData) => ({
                              title: fp.title,
                              min_price: fp.min_price,
                              max_price: fp.max_price,
                              unit_size: fp.unit_size,
                              bedrooms:
                                  fp.bedrooms as Prisma.FloorPlanCreateInput['bedrooms'],
                              bathrooms:
                                  fp.bathrooms as Prisma.FloorPlanCreateInput['bathrooms'],
                              image_urls: fp.image_urls,
                          })),
                      }
                    : undefined,
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
    });

    return project;
};

export const deleteProjectService = async (
    projectId: string,
    developerId: string
) => {
    // First check if the project belongs to the developer
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            developer_id: developerId,
        },
    });

    if (!project) {
        return null;
    }

    // Delete related records first (cascading delete)
    await prisma.floorPlan.deleteMany({
        where: { project_id: projectId },
    });

    await prisma.inventory.deleteMany({
        where: { project_id: projectId },
    });

    // Delete the project
    const deletedProject = await prisma.project.delete({
        where: { id: projectId },
    });

    return deletedProject;
};

/**
 * Get projects with RBAC filtering
 */
export const getProjectsWithRBACService = async (adminUserId: string) => {
    return await PermissionChecker.getAccessibleProjects(adminUserId);
};

/**
 * Get project by ID with RBAC validation
 */
export const getProjectByIdWithRBACService = async (
    adminUserId: string,
    projectId: string
) => {
    const canView = await PermissionChecker.canViewProject(
        adminUserId,
        projectId
    );

    if (!canView) {
        throw new Error('Access denied: Cannot view this project');
    }

    return await prisma.project.findUnique({
        where: { id: projectId },
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
    });
};
