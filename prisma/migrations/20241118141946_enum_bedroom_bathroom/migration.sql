/*
  Warnings:

  - Changed the type of `no_of_bathrooms` on the `Listing` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `no_of_bedrooms` on the `Listing` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Bedrooms" AS ENUM ('Studio', 'One', 'Two', 'Three', 'Four_Plus');

-- CreateEnum
CREATE TYPE "Bathrooms" AS ENUM ('One', 'Two', 'Three_Plus');

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "no_of_bathrooms",
ADD COLUMN     "no_of_bathrooms" "Bathrooms" NOT NULL,
DROP COLUMN "no_of_bedrooms",
ADD COLUMN     "no_of_bedrooms" "Bedrooms" NOT NULL;
