/*
  Warnings:

  - You are about to drop the `_DeveloperBrokers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DeveloperBrokers" DROP CONSTRAINT "_DeveloperBrokers_A_fkey";

-- DropForeignKey
ALTER TABLE "_DeveloperBrokers" DROP CONSTRAINT "_DeveloperBrokers_B_fkey";

-- AlterTable
ALTER TABLE "Broker" ADD COLUMN     "brokerageId" TEXT;

-- DropTable
DROP TABLE "_DeveloperBrokers";

-- CreateTable
CREATE TABLE "Brokerage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ded" TEXT,
    "rera" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "service_areas" TEXT[],
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brokerage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Broker" ADD CONSTRAINT "Broker_brokerageId_fkey" FOREIGN KEY ("brokerageId") REFERENCES "Brokerage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brokerage" ADD CONSTRAINT "Brokerage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
