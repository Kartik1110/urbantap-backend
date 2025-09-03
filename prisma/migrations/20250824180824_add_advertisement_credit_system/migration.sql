-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('COMPANY_POST', 'JOB', 'LISTING');

-- AlterTable
ALTER TABLE "CompanyPost" ADD COLUMN     "expiry_date" TIMESTAMP(3),
ADD COLUMN     "is_sponsored" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "Credit" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "credits_spent" INTEGER NOT NULL,
    "type_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Credit_company_id_key" ON "Credit"("company_id");

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
