/*
  Warnings:

  - You are about to drop the column `companyId` on the `Brokerage` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Brokerage` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Brokerage` table. All the data in the column will be lost.
  - You are about to drop the column `coverImage` on the `Developer` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `jobType` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `workplaceType` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `CurrentStatus` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `DealType` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `Market` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `Type_of_use` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `Views` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `handoverQuarter` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `handoverYear` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `developerId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `floorPlans` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `furnishing` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `noOfBathrooms` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `noOfBedrooms` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `paymentPlan` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `projectAge` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `projectName` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `propertySize` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `unitTypes` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Project` table. All the data in the column will be lost.
  - Added the required column `company_id` to the `Brokerage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Brokerage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `job_type` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workplace_type` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `developer_id` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `furnished` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `no_of_bathrooms` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `no_of_bedrooms` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_plan` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_age` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_name` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `property_size` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Brokerage" DROP CONSTRAINT "Brokerage_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_developerId_fkey";

-- AlterTable
ALTER TABLE "Brokerage" DROP COLUMN "companyId",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "company_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Developer" DROP COLUMN "coverImage",
ADD COLUMN     "cover_image" TEXT;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "companyId",
DROP COLUMN "jobType",
DROP COLUMN "workplaceType",
ADD COLUMN     "company_id" TEXT NOT NULL,
ADD COLUMN     "job_type" "JobType" NOT NULL,
ADD COLUMN     "workplace_type" "WorkplaceType" NOT NULL;

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "CurrentStatus",
DROP COLUMN "DealType",
DROP COLUMN "Market",
DROP COLUMN "Type_of_use",
DROP COLUMN "Views",
DROP COLUMN "handoverQuarter",
DROP COLUMN "handoverYear",
ADD COLUMN     "current_status" "CurrentStatus",
ADD COLUMN     "deal_type" "DealType",
ADD COLUMN     "handover_quarter" "Quarter",
ADD COLUMN     "handover_year" INTEGER,
ADD COLUMN     "market" "Market",
ADD COLUMN     "type_of_use" "Type_of_use",
ADD COLUMN     "views" "Views";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "createdAt",
DROP COLUMN "developerId",
DROP COLUMN "floorPlans",
DROP COLUMN "furnishing",
DROP COLUMN "noOfBathrooms",
DROP COLUMN "noOfBedrooms",
DROP COLUMN "paymentPlan",
DROP COLUMN "projectAge",
DROP COLUMN "projectName",
DROP COLUMN "propertySize",
DROP COLUMN "unitTypes",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "developer_id" TEXT NOT NULL,
ADD COLUMN     "floor_plans" TEXT[],
ADD COLUMN     "furnished" "Furnished" NOT NULL,
ADD COLUMN     "no_of_bathrooms" "Bathrooms" NOT NULL,
ADD COLUMN     "no_of_bedrooms" "Bedrooms" NOT NULL,
ADD COLUMN     "payment_plan" "Payment_Plan" NOT NULL,
ADD COLUMN     "project_age" TEXT NOT NULL,
ADD COLUMN     "project_name" TEXT NOT NULL,
ADD COLUMN     "property_size" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unit_types" TEXT[],
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "Developer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brokerage" ADD CONSTRAINT "Brokerage_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
