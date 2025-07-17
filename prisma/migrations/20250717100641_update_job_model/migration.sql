/*
  Warnings:

  - The `description` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "skills" TEXT[],
DROP COLUMN "description",
ADD COLUMN     "description" TEXT[];
