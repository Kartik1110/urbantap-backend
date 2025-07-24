-- CreateEnum
CREATE TYPE "Speciality" AS ENUM ('Villa', 'Apartment', 'Townhouse', 'Office', 'Shop');

-- AlterTable
ALTER TABLE "Broker" ADD COLUMN     "speciality" "Speciality"[] DEFAULT ARRAY[]::"Speciality"[];
