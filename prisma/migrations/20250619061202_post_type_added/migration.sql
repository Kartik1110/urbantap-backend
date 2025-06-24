-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('Looking', 'Offering');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "PostType" "PostType";
