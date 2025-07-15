-- AlterTable
ALTER TABLE "Brokerage" ADD COLUMN     "about" TEXT;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "brokerage_id" TEXT;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_brokerage_id_fkey" FOREIGN KEY ("brokerage_id") REFERENCES "Brokerage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
