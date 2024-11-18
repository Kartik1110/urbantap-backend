/*
  Warnings:

  - You are about to drop the column `max_sq_ft` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `min_sq_ft` on the `Listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "max_sq_ft",
DROP COLUMN "min_sq_ft",
ADD COLUMN     "sq_ft" DOUBLE PRECISION;
