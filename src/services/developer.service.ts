import prisma from '../utils/prisma';

export const getDevelopersService = async ({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) => {
  try {
    const skip = (page - 1) * pageSize;

    const [developersRaw, totalCount] = await Promise.all([
      prisma.developer.findMany({
        skip,
        take: pageSize,
        select: {
          name: true,
          logo: true,
          projects: {
            select: { id: true },
          },
        },
      }),
      prisma.developer.count(),
    ]);

    const developers = developersRaw.map(dev => ({
      name: dev.name,
      logo: dev.logo,
      project_count: dev.projects.length,
    }));

    const pagination = {
      page,
      pageSize,
      total: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    };

    return { developers, pagination };
  } catch (error) {
    throw error;
  }
};

export const createDeveloperService = async (data: {
    name: string;
    logo: string;
    coverImage?: string;
    description: string;
    email?: string;
    phone?: string;
  }) => {
    try {
      return await prisma.developer.create({
        data,
      });
    } catch (error) {
      throw error;
    }
  };

