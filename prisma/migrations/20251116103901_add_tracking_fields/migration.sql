/*
  Warnings:

  - A unique constraint covering the columns `[switchId]` on the table `Switch` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Switch" ADD COLUMN     "billAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "electricityRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "hoursON" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastOnTime" TIMESTAMP(3),
ADD COLUMN     "powerConsumed" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "powerRating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "switchId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Switch_switchId_key" ON "Switch"("switchId");
