/*
  Warnings:

  - You are about to drop the column `driverId` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the `_TripToWorker` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Trip" DROP CONSTRAINT "Trip_driverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TripToWorker" DROP CONSTRAINT "_TripToWorker_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_TripToWorker" DROP CONSTRAINT "_TripToWorker_B_fkey";

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "driverId";

-- DropTable
DROP TABLE "public"."_TripToWorker";

-- CreateTable
CREATE TABLE "_TravelerTrip" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TravelerTrip_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DriverTrip" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DriverTrip_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TravelerTrip_B_index" ON "_TravelerTrip"("B");

-- CreateIndex
CREATE INDEX "_DriverTrip_B_index" ON "_DriverTrip"("B");

-- AddForeignKey
ALTER TABLE "_TravelerTrip" ADD CONSTRAINT "_TravelerTrip_A_fkey" FOREIGN KEY ("A") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TravelerTrip" ADD CONSTRAINT "_TravelerTrip_B_fkey" FOREIGN KEY ("B") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DriverTrip" ADD CONSTRAINT "_DriverTrip_A_fkey" FOREIGN KEY ("A") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DriverTrip" ADD CONSTRAINT "_DriverTrip_B_fkey" FOREIGN KEY ("B") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
