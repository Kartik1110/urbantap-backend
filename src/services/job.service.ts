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
