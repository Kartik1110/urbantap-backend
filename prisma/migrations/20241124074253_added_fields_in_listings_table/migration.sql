-- CreateEnum
CREATE TYPE "Project_Age" AS ENUM ('Less_than_5_years', 'More_than_5_years');

-- CreateEnum
CREATE TYPE "Payment_Plan" AS ENUM ('Payment_done', 'Payment_Pending');

-- CreateEnum
CREATE TYPE "Sale_Type" AS ENUM ('Direct', 'Resale');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "payment_plan" "Payment_Plan",
ADD COLUMN     "project_age" "Project_Age",
ADD COLUMN     "sale_type" "Sale_Type";
