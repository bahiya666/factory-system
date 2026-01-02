-- Enums for ProductKind and SizeKey
DO $$ BEGIN
  CREATE TYPE "ProductKind" AS ENUM ('BELLA','PANEL','WINGBACK');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "SizeKey" AS ENUM ('SINGLE','THREE_QUARTER','DOUBLE','QUEEN','ANY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateTable
CREATE TABLE "CuttingRule" (
    "id" SERIAL NOT NULL,
    "department" "Department" NOT NULL,
    "productKind" "ProductKind" NOT NULL,
    "sizeKey" "SizeKey" NOT NULL,
    "material" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "quantityPer" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "CuttingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuttingSlip" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "department" "Department" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "CuttingSlip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuttingPiece" (
    "id" SERIAL NOT NULL,
    "slipId" INTEGER NOT NULL,
    "material" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "note" TEXT,
    "colorId" INTEGER,

    CONSTRAINT "CuttingPiece_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CuttingSlip_orderId_department_key" ON "CuttingSlip"("orderId", "department");

-- AddForeignKey
ALTER TABLE "CuttingSlip" ADD CONSTRAINT "CuttingSlip_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuttingPiece" ADD CONSTRAINT "CuttingPiece_slipId_fkey" FOREIGN KEY ("slipId") REFERENCES "CuttingSlip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuttingPiece" ADD CONSTRAINT "CuttingPiece_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;
