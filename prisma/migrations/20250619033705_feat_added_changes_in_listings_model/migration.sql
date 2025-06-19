-- CreateEnum
CREATE TYPE "Type_of_use" AS ENUM ('Commercial', 'Residential', 'Mixed');

-- CreateEnum
CREATE TYPE "Quarter" AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');

-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('Rental', 'Selling');

-- CreateEnum
CREATE TYPE "CurrentStatus" AS ENUM ('Occupied', 'Vacant');

-- CreateEnum
CREATE TYPE "Views" AS ENUM ('Classic', 'City', 'Community', 'Water', 'Sea', 'Canal', 'Park', 'Lagoon', 'Golf_Course', 'Others');

-- CreateEnum
CREATE TYPE "Market" AS ENUM ('Primary', 'Secondary');

-- AlterEnum
ALTER TYPE "Furnished" ADD VALUE 'Kitchen_Appliances_only';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Type" ADD VALUE 'Retail';
ALTER TYPE "Type" ADD VALUE 'Warehouse';

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "CurrentStatus" "CurrentStatus",
ADD COLUMN     "DealType" "DealType",
ADD COLUMN     "Market" "Market",
ADD COLUMN     "Type_of_use" "Type_of_use",
ADD COLUMN     "Views" "Views",
ADD COLUMN     "cheques" INTEGER,
ADD COLUMN     "handoverQuarter" "Quarter",
ADD COLUMN     "handoverYear" INTEGER;
