/*
  Warnings:

  - You are about to drop the column `contact_email` on the `Brokerage` table. All the data in the column will be lost.
  - You are about to drop the column `contact_phone` on the `Brokerage` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Brokerage` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `Brokerage` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Brokerage` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Developer` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Developer` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `Developer` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Developer` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Developer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Brokerage" DROP COLUMN "contact_email",
DROP COLUMN "contact_phone",
DROP COLUMN "description",
DROP COLUMN "logo",
DROP COLUMN "name";

-- AlterTable
ALTER TABLE "Developer" DROP COLUMN "description",
DROP COLUMN "email",
DROP COLUMN "logo",
DROP COLUMN "name",
DROP COLUMN "phone";
