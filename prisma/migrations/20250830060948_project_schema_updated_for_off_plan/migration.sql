/*
  Warnings:

  - You are about to drop the column `floor_plans` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `no_of_bathrooms` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `no_of_bedrooms` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Project` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Bedrooms" ADD VALUE 'Four';
ALTER TYPE "Bedrooms" ADD VALUE 'Five';
ALTER TYPE "Bedrooms" ADD VALUE 'Six';
ALTER TYPE "Bedrooms" ADD VALUE 'Seven';

-- AlterTable
ALTER TABLE "Developer" ADD COLUMN     "total_projects" INTEGER,
ADD COLUMN     "years_in_business" INTEGER;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "floor_plans",
DROP COLUMN "no_of_bathrooms",
DROP COLUMN "no_of_bedrooms",
DROP COLUMN "price",
ADD COLUMN     "handover_time" TIMESTAMP(3),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "locality" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "max_bedrooms" "Bedrooms",
ADD COLUMN     "max_price" DOUBLE PRECISION,
ADD COLUMN     "max_sq_ft" DOUBLE PRECISION,
ADD COLUMN     "min_bedrooms" "Bedrooms",
ADD COLUMN     "min_price" DOUBLE PRECISION,
ADD COLUMN     "min_sq_ft" DOUBLE PRECISION,
ADD COLUMN     "payment_plan2" TEXT,
ALTER COLUMN "amenities" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "payment_plan" DROP NOT NULL,
ALTER COLUMN "property_size" DROP NOT NULL;

-- CreateTable
CREATE TABLE "FloorPlan" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "min_price" DOUBLE PRECISION,
    "max_price" DOUBLE PRECISION,
    "unit_size" DOUBLE PRECISION,
    "bedrooms" "Bedrooms",
    "project_id" TEXT NOT NULL,

    CONSTRAINT "FloorPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FloorPlan" ADD CONSTRAINT "FloorPlan_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
