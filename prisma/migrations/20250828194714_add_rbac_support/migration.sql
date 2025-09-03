/*
  Warnings:

  - You are about to drop the column `companyId` on the `AdminUser` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `AdminUser` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `AdminUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[broker_id]` on the table `AdminUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[admin_user_id]` on the table `Broker` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `company_id` to the `AdminUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `AdminUser` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AdminUserType" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('CREATE_JOB', 'EDIT_JOB', 'VIEW_JOB', 'DELETE_JOB', 'CREATE_COMPANY_POST', 'EDIT_COMPANY_POST', 'VIEW_COMPANY_POST', 'DELETE_COMPANY_POST');

-- DropForeignKey
ALTER TABLE "AdminUser" DROP CONSTRAINT "AdminUser_companyId_fkey";

-- AlterTable
ALTER TABLE "AdminUser" 
ADD COLUMN     "broker_id" TEXT,
ADD COLUMN     "company_id" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role_group_id" TEXT,
ADD COLUMN     "type" "AdminUserType" DEFAULT 'ADMIN',
ADD COLUMN     "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Migrate existing data
UPDATE "AdminUser" SET 
    "company_id" = "companyId",
    "created_at" = COALESCE("createdAt", CURRENT_TIMESTAMP),
    "updated_at" = COALESCE("updatedAt", CURRENT_TIMESTAMP),
    "type" = 'ADMIN'
WHERE "company_id" IS NULL;

-- Now make the columns NOT NULL after data migration
ALTER TABLE "AdminUser" 
ALTER COLUMN "company_id" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'MEMBER';

-- Drop old columns
ALTER TABLE "AdminUser" 
DROP COLUMN "companyId",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Broker" ADD COLUMN     "admin_user_id" TEXT;

-- AlterTable
ALTER TABLE "CompanyPost" ADD COLUMN     "adminUserId" TEXT;

-- CreateTable
CREATE TABLE "RoleGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" "Permission"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_broker_id_key" ON "AdminUser"("broker_id");

-- CreateIndex
CREATE UNIQUE INDEX "Broker_admin_user_id_key" ON "Broker"("admin_user_id");

-- AddForeignKey
ALTER TABLE "Broker" ADD CONSTRAINT "Broker_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_role_group_id_fkey" FOREIGN KEY ("role_group_id") REFERENCES "RoleGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPost" ADD CONSTRAINT "CompanyPost_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
