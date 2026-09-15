/*
  Warnings:

  - A unique constraint covering the columns `[vendorCode]` on the table `VendorProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "vendorCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_vendorCode_key" ON "VendorProfile"("vendorCode");
