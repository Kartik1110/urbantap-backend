/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `jobId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Application` table. All the data in the column will be lost.
  - Added the required column `job_id` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_userId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "createdAt",
DROP COLUMN "jobId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "job_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
