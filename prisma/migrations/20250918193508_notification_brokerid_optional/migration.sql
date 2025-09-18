-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_broker_id_fkey";

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "broker_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "Broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
