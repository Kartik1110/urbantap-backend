/*
  Warnings:

  - Added the required column `currency` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'AED', 'INR');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "currency" "Currency" NOT NULL,
ADD COLUMN     "max_experience" INTEGER,
ADD COLUMN     "max_salary" DOUBLE PRECISION,
ADD COLUMN     "min_experience" INTEGER,
ADD COLUMN     "min_salary" DOUBLE PRECISION;
