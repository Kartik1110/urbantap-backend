-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Permission" ADD VALUE 'CREATE_PROJECT';
ALTER TYPE "Permission" ADD VALUE 'EDIT_PROJECT';
ALTER TYPE "Permission" ADD VALUE 'VIEW_PROJECT';
ALTER TYPE "Permission" ADD VALUE 'DELETE_PROJECT';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "admin_user_id" TEXT;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
