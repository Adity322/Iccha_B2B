-- AlterTable: allow a Warehouse to exist without a vendor (platform/admin-owned)
ALTER TABLE "Warehouse" DROP CONSTRAINT "Warehouse_vendorId_fkey";

ALTER TABLE "Warehouse" ALTER COLUMN "vendorId" DROP NOT NULL;

ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;