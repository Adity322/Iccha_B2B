-- CreateTable
CREATE TABLE "ProductUploadSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "mediaAssetId" TEXT,
    "warehouseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductUploadSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductUploadSession_token_key" ON "ProductUploadSession"("token");

-- CreateIndex
CREATE INDEX "ProductUploadSession_vendorId_idx" ON "ProductUploadSession"("vendorId");

-- CreateIndex
CREATE INDEX "ProductUploadSession_token_idx" ON "ProductUploadSession"("token");

-- AddForeignKey
ALTER TABLE "ProductUploadSession" ADD CONSTRAINT "ProductUploadSession_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUploadSession" ADD CONSTRAINT "ProductUploadSession_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductUploadSession" ADD CONSTRAINT "ProductUploadSession_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
