/*
  Warnings:

  - Added the required column `country_code` to the `Broker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Broker" ADD COLUMN     "country_code" TEXT NOT NULL;
