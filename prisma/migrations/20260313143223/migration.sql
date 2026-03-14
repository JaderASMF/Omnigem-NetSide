/*
  Warnings:

  - You are about to drop the column `category` on the `VehicleExpense` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."VehicleExpense_vehicleId_workerId_idx";

-- AlterTable
ALTER TABLE "VehicleExpense" DROP COLUMN "category",
ADD COLUMN     "categoryId" INTEGER;

-- CreateTable
CREATE TABLE "VehicleExpenseCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleExpenseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleExpenseCategory_name_key" ON "VehicleExpenseCategory"("name");

-- CreateIndex
CREATE INDEX "VehicleExpense_vehicleId_workerId_categoryId_idx" ON "VehicleExpense"("vehicleId", "workerId", "categoryId");

-- AddForeignKey
ALTER TABLE "VehicleExpense" ADD CONSTRAINT "VehicleExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "VehicleExpenseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
