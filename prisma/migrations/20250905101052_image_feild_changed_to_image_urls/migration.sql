/*
  Warnings:

  - You are about to drop the column `images` on the `FloorPlan` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FloorPlan" DROP COLUMN "images",
ADD COLUMN     "image_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "images",
ADD COLUMN     "image_urls" TEXT[];

-- Rename column
ALTER TABLE "Project" RENAME COLUMN "payment_plan2" TO "payment_structure";
