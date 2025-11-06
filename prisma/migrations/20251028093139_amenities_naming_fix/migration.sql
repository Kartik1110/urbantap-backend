/*
  Warnings:

  - The values [fPrivate_Beach_Access] on the enum `Amenities` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Amenities_new" AS ENUM ('Pets_Allowed', 'Swimming_Pool', 'Gym', 'Parking', 'Security', 'Balcony', 'Garden', 'Air_Conditioning', 'Furnished', 'Heating', 'Jaccuzi', 'Play_Area', 'Lobby', 'Scenic_View', 'Wardrobes', 'Spa', 'Kitchen_Appliances', 'Barbecue_Area', 'Study', 'Concierge_Service', 'Private_Beach_Access', 'Restaurants_and_Cafes', 'Co_working_Spaces', 'Padel_Tennis_Court', 'Golf', 'Basketball_Court', 'Walking_and_Jogging_Tracks', 'Open_Air_Cinema', 'Gaming_Area');
ALTER TABLE "Project" ALTER COLUMN "amenities" DROP DEFAULT;
ALTER TABLE "Project" ALTER COLUMN "amenities" TYPE "Amenities_new"[] USING ("amenities"::text::"Amenities_new"[]);
ALTER TYPE "Amenities" RENAME TO "Amenities_old";
ALTER TYPE "Amenities_new" RENAME TO "Amenities";
DROP TYPE "Amenities_old";
ALTER TABLE "Project" ALTER COLUMN "amenities" SET DEFAULT ARRAY[]::"Amenities"[];
COMMIT;
