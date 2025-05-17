-- CreateEnum
CREATE TYPE "BrokerType" AS ENUM ('Off_plan', 'Ready_to_move', 'Both');

-- AlterTable
ALTER TABLE "Broker" ADD COLUMN     "type" "BrokerType";
