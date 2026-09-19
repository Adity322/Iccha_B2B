-- AlterTable
ALTER TABLE "SellerContactRequest" ADD COLUMN     "productId" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedByUserId" TEXT,
ALTER COLUMN "totalDesigns" SET DEFAULT 1,
ALTER COLUMN "totalSets" SET DEFAULT 0,
ALTER COLUMN "totalPieces" SET DEFAULT 0,
ALTER COLUMN "cartSubtotal" SET DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "SellerContactRequest_productId_idx" ON "SellerContactRequest"("productId");

-- CreateIndex
CREATE INDEX "SellerContactRequest_assignedToUserId_idx" ON "SellerContactRequest"("assignedToUserId");

-- CreateIndex
CREATE INDEX "SellerContactRequest_productId_retailerProfileId_status_idx" ON "SellerContactRequest"("productId", "retailerProfileId", "status");

-- AddForeignKey
ALTER TABLE "SellerContactRequest" ADD CONSTRAINT "SellerContactRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
