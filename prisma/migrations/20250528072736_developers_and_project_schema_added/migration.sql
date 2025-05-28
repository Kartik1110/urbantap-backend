-- CreateTable
CREATE TABLE "Developer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "coverImage" TEXT,
    "description" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "images" TEXT[],
    "floorPlans" TEXT[],
    "price" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "city" "City" NOT NULL,
    "file_url" TEXT,
    "type" "Category" NOT NULL,
    "projectName" TEXT NOT NULL,
    "projectAge" TEXT NOT NULL,
    "noOfBedrooms" "Bedrooms" NOT NULL,
    "noOfBathrooms" "Bathrooms" NOT NULL,
    "furnishing" "Furnished" NOT NULL,
    "propertySize" DOUBLE PRECISION NOT NULL,
    "paymentPlan" "Payment_Plan" NOT NULL,
    "unitTypes" TEXT[],
    "amenities" TEXT[],
    "developerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DeveloperBrokers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DeveloperBrokers_AB_unique" ON "_DeveloperBrokers"("A", "B");

-- CreateIndex
CREATE INDEX "_DeveloperBrokers_B_index" ON "_DeveloperBrokers"("B");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeveloperBrokers" ADD CONSTRAINT "_DeveloperBrokers_A_fkey" FOREIGN KEY ("A") REFERENCES "Broker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeveloperBrokers" ADD CONSTRAINT "_DeveloperBrokers_B_fkey" FOREIGN KEY ("B") REFERENCES "Developer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
