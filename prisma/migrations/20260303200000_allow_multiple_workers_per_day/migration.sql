-- DropIndex
DROP INDEX IF EXISTS "Assignment_date_key";

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_date_workerId_key" ON "Assignment"("date", "workerId");
