-- CreateTable
CREATE TABLE "Switch" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isOn" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Switch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Switch_name_key" ON "Switch"("name");
