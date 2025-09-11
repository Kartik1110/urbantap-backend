/*
  Warnings:

  - The `amenities` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Amenities" AS ENUM ('Pets_Allowed', 'Swimming_Pool', 'Gymnasium', 'Parking', 'Security', 'Balcony', 'Garden', 'Air_Conditioning', 'Heating', 'Jaccuzi', 'Play_Area', 'Lobby', 'Scenic_View', 'Wardrobes', 'Spa', 'Kitchen_Appliances', 'Barbecue_Area', 'Study', 'Concierge_Service');

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "amenities",
ADD COLUMN     "amenities" "Amenities"[] DEFAULT ARRAY[]::"Amenities"[];
