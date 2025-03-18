-- CreateTable
CREATE TABLE "ReportedListing" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "reported_by_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportedListing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReportedListing" ADD CONSTRAINT "ReportedListing_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportedListing" ADD CONSTRAINT "ReportedListing_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "Broker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
