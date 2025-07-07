/*
  Warnings:

  - You are about to drop the column `listingId` on the `ListingView` table. All the data in the column will be lost.
  - You are about to drop the column `viewedAt` on the `ListingView` table. All the data in the column will be lost.
  - Added the required column `listing_id` to the `ListingView` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ListingView" DROP CONSTRAINT "ListingView_listingId_fkey";

-- AlterTable
ALTER TABLE "ListingView" DROP COLUMN "listingId",
DROP COLUMN "viewedAt",
ADD COLUMN     "listing_id" TEXT NOT NULL,
ADD COLUMN     "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "ListingView" ADD CONSTRAINT "ListingView_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
