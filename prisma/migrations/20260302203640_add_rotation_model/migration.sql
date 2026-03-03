-- CreateTable
CREATE TABLE "Rotation" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "weekdays" INTEGER[],
    "workerIds" INTEGER[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rotation_pkey" PRIMARY KEY ("id")
);
