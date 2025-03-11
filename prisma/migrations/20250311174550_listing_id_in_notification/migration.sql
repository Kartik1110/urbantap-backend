-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "listing_id" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
