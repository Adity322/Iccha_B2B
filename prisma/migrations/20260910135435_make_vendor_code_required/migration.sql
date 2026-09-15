/*
  Warnings:

  - Made the column `vendorCode` on table `VendorProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "VendorProfile" ALTER COLUMN "vendorCode" SET NOT NULL;
