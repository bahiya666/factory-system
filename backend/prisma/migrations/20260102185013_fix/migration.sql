/*
  Warnings:

  - You are about to drop the column `color` on the `CuttingPiece` table. All the data in the column will be lost.
  - Added the required column `productKind` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeKey` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CuttingPiece" DROP COLUMN "color";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productKind" "ProductKind" NOT NULL,
ADD COLUMN     "sizeKey" "SizeKey" NOT NULL;
