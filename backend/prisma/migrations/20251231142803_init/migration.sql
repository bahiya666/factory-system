-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DEPARTMENT');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('WOOD', 'FOAM', 'MATERIALS', 'UPHOLSTERY', 'PACKAGING', 'DELIVERY', 'INVENTORY');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "department" "Department",

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
