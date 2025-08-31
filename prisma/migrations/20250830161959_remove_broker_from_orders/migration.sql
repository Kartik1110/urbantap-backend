/*
  Warnings:

  - You are about to drop the column `broker_id` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_broker_id_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "broker_id";
