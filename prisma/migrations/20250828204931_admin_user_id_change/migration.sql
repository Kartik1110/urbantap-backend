/*
  Warnings:

  - You are about to drop the column `adminUserId` on the `CompanyPost` table. All the data in the column will be lost.
  - You are about to drop the column `adminUserId` on the `Job` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CompanyPost" DROP CONSTRAINT "CompanyPost_adminUserId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_adminUserId_fkey";

-- AlterTable
ALTER TABLE "CompanyPost" DROP COLUMN "adminUserId",
ADD COLUMN     "admin_user_id" TEXT;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "adminUserId",
ADD COLUMN     "admin_user_id" TEXT;

-- AddForeignKey
ALTER TABLE "CompanyPost" ADD CONSTRAINT "CompanyPost_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
