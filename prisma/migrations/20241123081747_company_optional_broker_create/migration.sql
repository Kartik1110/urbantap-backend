-- DropForeignKey
ALTER TABLE "Broker" DROP CONSTRAINT "Broker_company_id_fkey";

-- AlterTable
ALTER TABLE "Broker" ALTER COLUMN "company_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Broker" ADD CONSTRAINT "Broker_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
