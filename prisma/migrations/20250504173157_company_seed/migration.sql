-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "address" TEXT DEFAULT '',
ADD COLUMN     "email" TEXT DEFAULT '',
ADD COLUMN     "name_ar" TEXT,
ADD COLUMN     "phone" TEXT DEFAULT '',
ADD COLUMN     "type" "CompanyType" NOT NULL DEFAULT 'Other',
ADD COLUMN     "website" TEXT DEFAULT '';
