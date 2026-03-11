-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'TRAVELER';
ALTER TYPE "Role" ADD VALUE 'SPED_MANAGER';

-- CreateTable
CREATE TABLE "Sped" (
    "id" SERIAL NOT NULL,
    "company" TEXT NOT NULL,
    "note" TEXT,
    "bankAccountStatus" INTEGER NOT NULL,
    "accountingSheetStatus" INTEGER,
    "icmsIpi" BOOLEAN,
    "pisCofins" BOOLEAN,
    "regime" INTEGER,
    "contactAttempts" INTEGER,
    "lastSent" TIMESTAMP(3),
    "reference" TEXT,
    "sendingEmails" TEXT[],
    "accessContact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sped_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" SERIAL NOT NULL,
    "destination" TEXT NOT NULL,
    "vehicle" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "client" TEXT,
    "installationTraining" TEXT,
    "mealExpense" DOUBLE PRECISION DEFAULT 0,
    "fuelExpense" DOUBLE PRECISION DEFAULT 0,
    "extraExpense" DOUBLE PRECISION DEFAULT 0,
    "total" DOUBLE PRECISION DEFAULT 0,
    "kmDriven" DOUBLE PRECISION DEFAULT 0,
    "costPerKm" DOUBLE PRECISION DEFAULT 0,
    "profitPerKm" DOUBLE PRECISION DEFAULT 0,
    "avgConsumption" DOUBLE PRECISION,
    "remainingAutonomy" DOUBLE PRECISION,
    "travelers" INTEGER,
    "drivers" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("id")
);
