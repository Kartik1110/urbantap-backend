/*
  Warnings:

  - The `project_age` column on the `Listing` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "project_age",
ADD COLUMN     "project_age" INTEGER;

-- DropEnum
DROP TYPE "Project_Age";
