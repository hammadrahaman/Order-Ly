/*
  Warnings:

  - A unique constraint covering the columns `[restaurantId,code]` on the table `MenuItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `MenuItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_restaurantId_code_key" ON "MenuItem"("restaurantId", "code");
