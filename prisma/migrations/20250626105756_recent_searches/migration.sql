-- CreateTable
CREATE TABLE "RecentSearch" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentSearch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecentSearch_userId_idx" ON "RecentSearch"("userId");

-- AddForeignKey
ALTER TABLE "RecentSearch" ADD CONSTRAINT "RecentSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
