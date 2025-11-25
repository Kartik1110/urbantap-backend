-- CreateEnum
CREATE TYPE "Status" AS ENUM ('NEW_LEAD', 'CONTACTED_LEAD', 'SITE_VISIT_SCHEDULED', 'VISIT_COMPLETED', 'DEAL_CLOSED', 'LOST_LEAD');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "w_number" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "project_id" TEXT,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BrokerToLead" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BrokerToLead_AB_unique" ON "_BrokerToLead"("A", "B");

-- CreateIndex
CREATE INDEX "_BrokerToLead_B_index" ON "_BrokerToLead"("B");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrokerToLead" ADD CONSTRAINT "_BrokerToLead_A_fkey" FOREIGN KEY ("A") REFERENCES "Broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BrokerToLead" ADD CONSTRAINT "_BrokerToLead_B_fkey" FOREIGN KEY ("B") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
