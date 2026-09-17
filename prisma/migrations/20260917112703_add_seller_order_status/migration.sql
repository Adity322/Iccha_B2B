-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "sellerOrderId" TEXT;

-- CreateTable
CREATE TABLE "SellerOrder" (
    "id" TEXT NOT NULL,
    "orderEnquiryId" TEXT NOT NULL,
    "vendorId" TEXT,
    "sellerName" TEXT NOT NULL,
    "status" "OrderEnquiryStatus" NOT NULL DEFAULT 'ENQUIRY_RECEIVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerOrderStatusHistory" (
    "id" TEXT NOT NULL,
    "sellerOrderId" TEXT NOT NULL,
    "status" "OrderEnquiryStatus" NOT NULL,
    "actorUserId" TEXT,
    "actorName" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerOrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellerOrder_orderEnquiryId_idx" ON "SellerOrder"("orderEnquiryId");

-- CreateIndex
CREATE INDEX "SellerOrder_vendorId_idx" ON "SellerOrder"("vendorId");

-- CreateIndex
CREATE INDEX "SellerOrder_status_idx" ON "SellerOrder"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SellerOrder_orderEnquiryId_vendorId_key" ON "SellerOrder"("orderEnquiryId", "vendorId");

-- CreateIndex
CREATE INDEX "SellerOrderStatusHistory_sellerOrderId_idx" ON "SellerOrderStatusHistory"("sellerOrderId");

-- AddForeignKey
ALTER TABLE "SellerOrder" ADD CONSTRAINT "SellerOrder_orderEnquiryId_fkey" FOREIGN KEY ("orderEnquiryId") REFERENCES "OrderEnquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerOrder" ADD CONSTRAINT "SellerOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "VendorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerOrderStatusHistory" ADD CONSTRAINT "SellerOrderStatusHistory_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "SellerOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "SellerOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
