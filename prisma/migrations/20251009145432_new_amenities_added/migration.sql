-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Amenities" ADD VALUE 'fPrivate_Beach_Access';
ALTER TYPE "Amenities" ADD VALUE 'Restaurants_and_Cafes';
ALTER TYPE "Amenities" ADD VALUE 'Co_working_Spaces';
ALTER TYPE "Amenities" ADD VALUE 'Padel_Tennis_Court';
ALTER TYPE "Amenities" ADD VALUE 'Golf';
ALTER TYPE "Amenities" ADD VALUE 'Basketball_Court';
ALTER TYPE "Amenities" ADD VALUE 'Walking_and_Jogging_Tracks';
ALTER TYPE "Amenities" ADD VALUE 'Open_Air_Cinema';
ALTER TYPE "Amenities" ADD VALUE 'Gaming_Area';
