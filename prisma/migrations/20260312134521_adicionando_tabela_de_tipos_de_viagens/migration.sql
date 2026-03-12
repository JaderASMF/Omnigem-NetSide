/*
  Warnings:

  - You are about to drop the column `installationTraining` on the `Trip` table. All the data in the column will be lost.
  - Added the required column `serviceTypeId` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "installationTraining",
ADD COLUMN     "price" DECIMAL(65,30) DEFAULT 0,
ADD COLUMN     "serviceTypeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ServiceType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_code_key" ON "ServiceType"("code");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
