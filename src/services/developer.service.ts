import prisma from "../utils/prisma";
import { Category, Prisma } from "@prisma/client";

export const getDevelopersService = async ({
  page,
  pageSize,
  search,
}: {
  page: number;
  pageSize: number;
  search?: string; // <- Add this line
}) => {
  try {
    const skip = (page - 1) * pageSize;

    const whereClause = search
      ? {
          name: {
            contains: search,
            mode: "insensitive" as Prisma.QueryMode,
          },
        }
      : {};

    const [developersRaw, totalCount] = await Promise.all([
      prisma.developer.findMany({
        where: whereClause,
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
      prisma.developer.count({
        where: whereClause,
      }),
    ]);

    const developers = developersRaw.map((dev) => ({
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
  cover_image?: string;
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

export const getDeveloperDetailsService = async (developerId: string) => {
  try {
    const developer = await prisma.developer.findUnique({
      where: { id: developerId },
      include: {
        projects: true,
        Broker: {
          include: {
            company: true, // include company data for each broker
          },
        },
      },
    });

    if (!developer) throw new Error("Developer not found");

    const projectCount = developer.projects.length;

    const groupedProjects = {
      all: developer.projects,
      off_plan: developer.projects.filter((p) => p.type === Category.Off_plan),
      ready: developer.projects.filter(
        (p) => p.type === Category.Ready_to_move
      ),
    };

    const brokers = developer.Broker.map((broker) => ({
      id: broker.id,
      name: broker.name,
      profile_pic: broker.profile_pic,
      company: broker.company
        ? {
            name: broker.company.name,
            logo: broker.company.logo,
            address: broker.company.address,
          }
        : null,
    }));

    return {
      id: developer.id,
      name: developer.name,
      logo: developer.logo,
      cover_image: developer.cover_image,
      description: developer.description,
      project_count: projectCount,
      contact: {
        email: developer.email,
        phone: developer.phone,
      },
      projects: groupedProjects,
      brokers, // ✅ added detailed broker info
    };
  } catch (error) {
    throw error;
  }
};
