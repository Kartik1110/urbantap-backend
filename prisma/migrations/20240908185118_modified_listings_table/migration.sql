/*
  Warnings:

  - Added the required column `category` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `furnished` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `looking_for` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `no_of_bathrooms` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `no_of_bedrooms` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rental_frequency` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Listing` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Ready_to_move', 'Off_plan', 'Rent');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('Apartment', 'Villa', 'Townhouse', 'Office');

-- CreateEnum
CREATE TYPE "Rental_frequency" AS ENUM ('Monthly', 'Quarterly', 'Yearly', 'Lease');

-- CreateEnum
CREATE TYPE "Furnished" AS ENUM ('Furnished', 'Semi_furnished', 'Unfurnished');

-- CreateEnum
CREATE TYPE "City" AS ENUM ('Dubai', 'Abu_Dhabi', 'Sharjah', 'Ajman', 'Ras_Al_Khaimah', 'Fujairah', 'Umm_Al_Quwain');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "amenities" TEXT[],
ADD COLUMN     "category" "Category" NOT NULL,
ADD COLUMN     "city" "City" NOT NULL,
ADD COLUMN     "furnished" "Furnished" NOT NULL,
ADD COLUMN     "image_urls" TEXT[],
ADD COLUMN     "looking_for" BOOLEAN NOT NULL,
ADD COLUMN     "no_of_bathrooms" INTEGER NOT NULL,
ADD COLUMN     "no_of_bedrooms" INTEGER NOT NULL,
ADD COLUMN     "rental_frequency" "Rental_frequency" NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "Type" NOT NULL;
