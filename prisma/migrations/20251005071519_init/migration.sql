/*
  Warnings:

  - You are about to drop the `Userr` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Userr";

-- CreateTable
CREATE TABLE "Userrr" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "emaill" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Userrr_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Userrr_emaill_key" ON "Userrr"("emaill");
