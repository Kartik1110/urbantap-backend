import prisma from "../utils/prisma";
import { Company } from "@prisma/client";

export const bulkInsertCompaniesService = async (companies: Company[]) => {
  try {
    return await prisma.company.createMany({
      data: companies,
    });
  } catch (error) {
    throw error;
  }
};