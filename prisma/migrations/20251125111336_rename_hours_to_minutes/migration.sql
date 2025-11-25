/*
  Warnings:

  - You are about to drop the column `hoursON` on the `Switch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Switch" DROP COLUMN "hoursON",
ADD COLUMN     "minutesON" INTEGER NOT NULL DEFAULT 0;
