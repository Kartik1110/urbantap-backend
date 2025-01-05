-- DropForeignKey
ALTER TABLE "Inquiry" DROP CONSTRAINT "Inquiry_listing_id_fkey";

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
