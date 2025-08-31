-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "admin_user_id" TEXT,
ADD COLUMN     "broker_id" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "Broker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
