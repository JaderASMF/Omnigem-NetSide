/*
  Warnings:

  - You are about to drop the column `vendor` on the `VehicleExpense` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."VehicleExpense_vehicleId_idx";

-- AlterTable
ALTER TABLE "VehicleExpense" DROP COLUMN "vendor",
ADD COLUMN     "workerId" INTEGER;

-- CreateIndex
CREATE INDEX "VehicleExpense_vehicleId_workerId_idx" ON "VehicleExpense"("vehicleId", "workerId");

-- AddForeignKey
ALTER TABLE "VehicleExpense" ADD CONSTRAINT "VehicleExpense_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
