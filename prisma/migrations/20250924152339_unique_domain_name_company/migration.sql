/*
  Warnings:

  - A unique constraint covering the columns `[domain_name]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "domain_name" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Company_domain_name_key" ON "Company"("domain_name");
