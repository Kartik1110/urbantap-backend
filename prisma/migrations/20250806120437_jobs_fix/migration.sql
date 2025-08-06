/*
  Warnings:

  - Added the required column `currency` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "updated_at" DROP NOT NULL;

-- AlterTable
-- First add the column as nullable
ALTER TABLE "Project" ADD COLUMN "currency" "Currency";

-- Update existing records with a default value (using AED as default)
UPDATE "Project" SET "currency" = 'AED' WHERE "currency" IS NULL;

-- Make the column required
ALTER TABLE "Project" ALTER COLUMN "currency" SET NOT NULL;
