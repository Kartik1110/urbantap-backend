import prisma from '../utils/prisma';
import { Prisma, City, Category } from '@prisma/client';

export const getProjectsService = async ({
    page,
    pageSize,
    title,
    location,
    type,
    developer,
}: {
    page: number;
    pageSize: number;
    title?: string;
    location?: string;
    type?: string;
    developer?: string;
}) => {
    const skip = (page - 1) * pageSize;

    const whereClause: Prisma.ProjectWhereInput = {
        ...(title && {
            title: {
                contains: title,
                mode: 'insensitive' as Prisma.QueryMode,
            },
        }),
        ...(location && {
            city: location as City,
        }),
        ...(type && {
            type: type as Category,
        }),
        ...(developer && {
            developer: {
                name: {
                    contains: developer,
                    mode: 'insensitive' as Prisma.QueryMode,
                },
            },
        }),
    };

    const [projectsRaw, totalCount] = await Promise.all([
        prisma.project.findMany({
            where: whereClause,
            skip,
            take: pageSize,
            include: {
                developer: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        cover_image: true,
                        description: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        }),
        prisma.project.count({ where: whereClause }),
    ]);

    const projects = projectsRaw.map((proj) => ({
        id: proj.id,
        type: proj.type,
        image: proj.image,
        title: proj.title,
        description: proj.description,
        developer: proj.developer,
    }));

    const pagination = {
        page,
        pageSize,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
    };

    return { projects, pagination };
};

export const getProjectByIdService = async (id: string) => {
    return await prisma.project.findUnique({
        where: { id },
        include: { developer: true },
    });
};

export const createProjectService = async (data: any) => {
    return await prisma.project.create({
        data,
    });
};
