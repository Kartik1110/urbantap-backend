-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "brokerage_id" TEXT;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_brokerage_id_fkey" FOREIGN KEY ("brokerage_id") REFERENCES "Brokerage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
