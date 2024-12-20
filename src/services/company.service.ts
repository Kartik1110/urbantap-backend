import prisma from "../utils/prisma";
import { Company } from "@prisma/client";

export const bulkInsertCompaniesService = async (companies: Company[]) => {
  try {
    await prisma.company.createMany({
      data: companies,
    });
    
    // Get the IDs of the newly created companies
    const createdCompanies = await prisma.company.findMany({
      where: {
        name: {
          in: companies.map(company => company.name)
        }
      },
      select: {
        id: true
      }
    });
    
    return createdCompanies.map(company => company.id);
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
