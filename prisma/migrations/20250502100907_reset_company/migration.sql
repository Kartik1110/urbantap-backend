-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('Developer', 'Brokerage', 'Other');

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "name" SET DEFAULT '';
