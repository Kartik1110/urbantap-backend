/*
  Warnings:

  - Added the required column `type` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('Developer', 'Brokerage');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "email" TEXT,
ADD COLUMN     "name_ar" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "type" "CompanyType" NOT NULL,
ADD COLUMN     "website" TEXT;
