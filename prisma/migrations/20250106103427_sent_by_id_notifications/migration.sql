/*
  Warnings:

  - Added the required column `sent_by_id` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "sent_by_id" TEXT NOT NULL;
