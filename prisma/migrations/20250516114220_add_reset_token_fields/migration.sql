-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetToken" VARCHAR(255),
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);
