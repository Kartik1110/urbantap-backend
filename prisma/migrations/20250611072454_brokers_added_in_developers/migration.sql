-- AlterTable
ALTER TABLE "Broker" ADD COLUMN     "developerId" TEXT;

-- AddForeignKey
ALTER TABLE "Broker" ADD CONSTRAINT "Broker_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
