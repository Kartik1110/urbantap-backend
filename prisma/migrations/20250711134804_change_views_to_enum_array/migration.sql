/*
  Warnings:

  - Changed the column `views` on the `Listing` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterTable
-- ALTER TABLE "Listing" ALTER COLUMN "views" SET DATA TYPE "Views"[];
ALTER TABLE "Listing" ALTER COLUMN "views" SET DATA TYPE "Views"[] USING ARRAY[views];

