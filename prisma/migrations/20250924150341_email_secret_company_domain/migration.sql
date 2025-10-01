-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "domain_name" TEXT DEFAULT '';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email_secret" TEXT;
