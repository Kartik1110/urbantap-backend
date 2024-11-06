-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "logo" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Listing" ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "max_price" DROP NOT NULL,
ALTER COLUMN "min_price" DROP NOT NULL;
