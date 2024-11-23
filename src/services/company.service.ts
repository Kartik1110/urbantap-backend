import prisma from "../utils/prisma";
import { Company } from "@prisma/client";
import { CreateCompanyInput } from '../schemas/company.schema';

export const bulkInsertCompaniesService = async (companies: CreateCompanyInput[]) => {
  try {
    return await prisma.company.createMany({
      data: companies,
    });
  } catch (error) {
    throw error;
  }
};

export const getCompaniesService = async () => {
  try {
    return await prisma.company.findMany();
  } catch (error) {
    throw error;
  }
};
