/*
  Warnings:

  - You are about to drop the column `speciality` on the `Broker` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Broker" DROP COLUMN "speciality",
ADD COLUMN     "specialities" "Speciality"[] DEFAULT ARRAY[]::"Speciality"[];
