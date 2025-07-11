/*
  Warnings:

  - A unique constraint covering the columns `[listing_id]` on the table `ListingView` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ListingView_listing_id_key" ON "ListingView"("listing_id");
