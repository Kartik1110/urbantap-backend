/*
  Warnings:

  - You are about to drop the column `locality` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `sq_ft` on the `Listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "locality",
DROP COLUMN "sq_ft",
ADD COLUMN     "max_sq_ft" DOUBLE PRECISION,
ADD COLUMN     "min_sq_ft" DOUBLE PRECISION;
