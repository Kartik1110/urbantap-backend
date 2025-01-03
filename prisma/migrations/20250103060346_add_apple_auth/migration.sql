/*
  Warnings:

  - A unique constraint covering the columns `[appleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "appleAccessToken" TEXT,
ADD COLUMN     "appleId" TEXT,
ADD COLUMN     "appleRefreshToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_appleId_key" ON "User"("appleId");
