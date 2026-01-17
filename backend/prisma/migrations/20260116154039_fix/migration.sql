/*
  Warnings:

  - A unique constraint covering the columns `[orderId,department]` on the table `CuttingSlip` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CuttingPiece" DROP CONSTRAINT "CuttingPiece_orderItemId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropIndex
DROP INDEX "CuttingPiece_slipId_orderItemId_idx";

-- AlterTable
ALTER TABLE "CuttingPiece" ALTER COLUMN "orderItemId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "productId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CuttingSlip_orderId_department_key" ON "CuttingSlip"("orderId", "department");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuttingPiece" ADD CONSTRAINT "CuttingPiece_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
