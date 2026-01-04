/*
  Warnings:

  - Added the required column `orderItemId` to the `CuttingPiece` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CuttingSlip_orderId_department_key";

-- AlterTable
ALTER TABLE "CuttingPiece" ADD COLUMN     "orderItemId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "CuttingPiece_slipId_orderItemId_idx" ON "CuttingPiece"("slipId", "orderItemId");

-- AddForeignKey
ALTER TABLE "CuttingPiece" ADD CONSTRAINT "CuttingPiece_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
