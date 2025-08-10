-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "expiry_date" TIMESTAMP(3),
ADD COLUMN     "is_sponsored" BOOLEAN DEFAULT false;
