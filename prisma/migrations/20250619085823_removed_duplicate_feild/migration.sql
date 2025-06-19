/*
  Warnings:

  - You are about to drop the column `PostType` on the `Listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "PostType";

-- DropEnum
DROP TYPE "PostType";
