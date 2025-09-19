/*
  Warnings:

  - You are about to drop the column `handover_time` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Project` table. All the data in the column will be lost.
  - Added the required column `category` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "handover_time",
DROP COLUMN "type",
ADD COLUMN     "category" "Category" NOT NULL,
ADD COLUMN     "handover_year" INTEGER;
