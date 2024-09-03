/*
  Warnings:

  - You are about to drop the column `company_name` on the `Broker` table. All the data in the column will be lost.
  - Added the required column `company_id` to the `Broker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Broker" DROP COLUMN "company_name",
ADD COLUMN     "company_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Broker" ADD CONSTRAINT "Broker_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
