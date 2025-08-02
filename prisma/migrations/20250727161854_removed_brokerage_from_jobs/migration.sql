/*
  Warnings:

  - You are about to drop the column `brokerage_id` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Job` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_brokerage_id_fkey";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "brokerage_id",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
