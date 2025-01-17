import { PrismaClient, Job, Role } from "@prisma/client";

const prisma = new PrismaClient();

export const createJobService = async (job: Job) => {
  if (job.userId) {
    const user = await prisma.user.findUnique({
      where: { id: job.userId, role: Role.HR },
    });

    if (!user) {
      throw new Error("User not found or is not an HR");
    }
  }

  if (job.companyId) {
    const company = await prisma.company.findUnique({
      where: { id: job.companyId },
    });

    if (!company) {
      throw new Error("Company not found");
    }
  }

  return await prisma.job.create({ data: job });
};

export const getJobsService = async (
  body: { page?: number; page_size?: number } = {}
) => {
  const { page = 1, page_size = 10 } = body;
  const skip = (page - 1) * page_size;
  const take = page_size;

  const jobs = await prisma.job.findMany({ skip, take, orderBy: { createdAt: 'desc' } });

  const totalJobs = await prisma.job.count();
  const totalPages = Math.ceil(totalJobs / page_size);

  const pagination = {
    total: totalJobs,
    totalPages,
    page,
    page_size,
  };

  return { jobs, pagination };
};
