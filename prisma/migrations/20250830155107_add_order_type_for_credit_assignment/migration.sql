-- AlterEnum
ALTER TYPE "OrderType" ADD VALUE 'CREDIT';

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "type_id" DROP NOT NULL;
