/*
  Warnings:

  - You are about to drop the column `user_id` on the `Company` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_user_id_fkey";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "user_id";
