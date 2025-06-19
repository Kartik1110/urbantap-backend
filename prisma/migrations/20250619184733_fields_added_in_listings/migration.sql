-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "construction_progress" INTEGER,
ADD COLUMN     "floor_area_ratio" DOUBLE PRECISION,
ADD COLUMN     "gfa_bua" INTEGER,
ADD COLUMN     "parking_space" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "service_charge" INTEGER;
