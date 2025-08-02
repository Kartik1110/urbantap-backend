/*
  Warnings:

  - You are about to drop the column `brokerageId` on the `AdminUser` table. All the data in the column will be lost.
  - You are about to drop the column `developerId` on the `AdminUser` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdminUser" DROP CONSTRAINT "AdminUser_brokerageId_fkey";

-- DropForeignKey
ALTER TABLE "AdminUser" DROP CONSTRAINT "AdminUser_developerId_fkey";

-- AlterTable
ALTER TABLE "AdminUser" DROP COLUMN "brokerageId",
DROP COLUMN "developerId";

-- AlterTable
ALTER TABLE "Brokerage" ALTER COLUMN "logo" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Developer" ALTER COLUMN "logo" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
