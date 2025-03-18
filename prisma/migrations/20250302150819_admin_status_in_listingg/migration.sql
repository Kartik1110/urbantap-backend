-- CreateEnum
CREATE TYPE "Admin_Status" AS ENUM ('Approved', 'Rejected', 'Pending');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "admin_status" "Admin_Status" DEFAULT 'Pending';
