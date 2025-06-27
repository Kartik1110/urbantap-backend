/*
  Warnings:

  - You are about to drop the column `userId` on the `RecentSearch` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `RecentSearch` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RecentSearch" DROP CONSTRAINT "RecentSearch_userId_fkey";

-- DropIndex
DROP INDEX "RecentSearch_userId_idx";

-- AlterTable
ALTER TABLE "RecentSearch" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "RecentSearch_user_id_idx" ON "RecentSearch"("user_id");

-- AddForeignKey
ALTER TABLE "RecentSearch" ADD CONSTRAINT "RecentSearch_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
