-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Broker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "info" TEXT NOT NULL,
    "y_o_e" INTEGER NOT NULL,
    "languages" TEXT[],
    "is_certified" BOOLEAN NOT NULL,
    "profile_pic" TEXT NOT NULL,
    "w_number" TEXT NOT NULL,
    "ig_link" TEXT,
    "linkedin_link" TEXT,
    "company_name" TEXT NOT NULL,

    CONSTRAINT "Broker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "selling_price" DOUBLE PRECISION NOT NULL,
    "sq_ft" DOUBLE PRECISION NOT NULL,
    "locality" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "broker_id" TEXT NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Broker_email_key" ON "Broker"("email");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "Broker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
