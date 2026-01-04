/*
  Warnings:

  - The `orderType` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'TAKEAWAY');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('OPEN', 'PAID');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "tableNumber" INTEGER,
DROP COLUMN "orderType",
ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'DINE_IN',
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'OPEN',
ALTER COLUMN "subTotal" SET DEFAULT 0,
ALTER COLUMN "tax" SET DEFAULT 0,
ALTER COLUMN "discount" SET DEFAULT 0,
ALTER COLUMN "total" SET DEFAULT 0;
