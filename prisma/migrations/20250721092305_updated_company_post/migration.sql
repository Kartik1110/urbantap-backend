/*
  Warnings:

  - You are about to drop the column `image` on the `CompanyPost` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PostPosition" AS ENUM ('Home', 'Listings', 'Jobs');

-- AlterTable
ALTER TABLE "CompanyPost" DROP COLUMN "image",
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "position" "PostPosition" NOT NULL DEFAULT 'Home',
ADD COLUMN     "rank" INTEGER NOT NULL DEFAULT 1;
