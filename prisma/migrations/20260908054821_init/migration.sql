-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SUPER_ADMIN', 'OPERATIONS_MANAGER', 'RETAILER');

-- CreateEnum
CREATE TYPE "RetailerAccountStatus" AS ENUM ('APPLICATION_RECEIVED', 'UNDER_REVIEW', 'ADDITIONAL_INFORMATION_REQUIRED', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "MOQScope" AS ENUM ('GLOBAL', 'CATEGORY', 'PRODUCT');

-- CreateEnum
CREATE TYPE "OrderEnquiryStatus" AS ENUM ('ENQUIRY_RECEIVED', 'UNDER_REVIEW', 'SELLER_CONTACTED', 'ESTIMATE_GENERATED', 'CONFIRMED', 'AWAITING_PAYMENT', 'PROCESSING', 'READY_FOR_DISPATCH', 'DISPATCHED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "HeroSlideStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HeroContentPosition" AS ENUM ('LEFT', 'RIGHT', 'CENTER');

-- CreateEnum
CREATE TYPE "HeroTextTheme" AS ENUM ('LIGHT', 'DARK');

-- CreateEnum
CREATE TYPE "MediaVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'RETAILER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "whatsapp" TEXT,
    "gstin" TEXT,
    "pan" TEXT,
    "businessType" TEXT NOT NULL DEFAULT 'boutique',
    "yearsInBusiness" INTEGER NOT NULL DEFAULT 1,
    "annualTurnover" TEXT,
    "status" "RetailerAccountStatus" NOT NULL DEFAULT 'APPLICATION_RECEIVED',
    "classificationId" TEXT,
    "moqSetsOverride" INTEGER,
    "moqDesignsOverride" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetailerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailerAddress" (
    "id" TEXT NOT NULL,
    "retailerProfileId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'billing',
    "street" TEXT NOT NULL,
    "area" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "landmark" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetailerAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetailerClassification" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "creditTermDays" INTEGER NOT NULL DEFAULT 0,
    "defaultDiscountPct" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetailerClassification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCApplication" (
    "id" TEXT NOT NULL,
    "retailerProfileId" TEXT NOT NULL,
    "gstin" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "RetailerAccountStatus" NOT NULL DEFAULT 'APPLICATION_RECEIVED',
    "rejectionReason" TEXT,
    "infoRequestNotes" TEXT,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KYCApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCDocument" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KYCDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYCActivity" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KYCActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingEntity" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT NOT NULL,
    "gstin" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    "registeredAddress" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "ifsc" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "upiId" TEXT,
    "estimatePrefix" TEXT NOT NULL,
    "invoicePrefix" TEXT NOT NULL,
    "defaultGstRate" DECIMAL(5,2) NOT NULL DEFAULT 5.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GSTConfiguration" (
    "id" TEXT NOT NULL,
    "billingEntityId" TEXT NOT NULL,
    "hsnCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cgstRate" DECIMAL(5,2) NOT NULL DEFAULT 2.5,
    "sgstRate" DECIMAL(5,2) NOT NULL DEFAULT 2.5,
    "igstRate" DECIMAL(5,2) NOT NULL DEFAULT 5.0,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GSTConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'kurti_pant_set',
    "billingEntityId" TEXT NOT NULL,
    "mediaAssetId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subcategory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mediaAssetId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "designNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    "collectionId" TEXT,
    "gstConfigId" TEXT,
    "wholesalePricePerPiece" DECIMAL(10,2) NOT NULL,
    "piecesPerSet" INTEGER NOT NULL DEFAULT 4,
    "wholesalePricePerSet" DECIMAL(10,2) NOT NULL,
    "availableSets" INTEGER NOT NULL DEFAULT 0,
    "totalAvailablePieces" INTEGER NOT NULL DEFAULT 0,
    "sizeCombination" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "fabric" TEXT NOT NULL,
    "workType" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "clothingType" TEXT NOT NULL,
    "hsnCode" TEXT NOT NULL DEFAULT '621142',
    "kurtiLength" TEXT,
    "bottomLength" TEXT,
    "dupattaLength" TEXT,
    "dupattaFabric" TEXT,
    "liningIncluded" BOOLEAN NOT NULL DEFAULT false,
    "pocketIncluded" BOOLEAN NOT NULL DEFAULT true,
    "neckPattern" TEXT,
    "sleeveLength" TEXT,
    "careInstruction" TEXT,
    "isNewArrival" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublicRepresentative" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMedia" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL DEFAULT 'MAIN_IMAGE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockAdjustment" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "previousSets" INTEGER NOT NULL,
    "adjustmentSets" INTEGER NOT NULL,
    "newSets" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "actorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockReservation" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderEnquiryId" TEXT NOT NULL,
    "reservedSets" INTEGER NOT NULL,
    "reservedPieces" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MOQRule" (
    "id" TEXT NOT NULL,
    "scope" "MOQScope" NOT NULL DEFAULT 'GLOBAL',
    "categoryId" TEXT,
    "productId" TEXT,
    "minSets" INTEGER NOT NULL DEFAULT 4,
    "minDesigns" INTEGER NOT NULL DEFAULT 1,
    "minPieces" INTEGER NOT NULL DEFAULT 16,
    "minOrderValue" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MOQRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MOQOverride" (
    "id" TEXT NOT NULL,
    "retailerProfileId" TEXT NOT NULL,
    "approvedByUserId" TEXT NOT NULL,
    "permittedMinSets" INTEGER NOT NULL DEFAULT 2,
    "reason" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MOQOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerContactRequest" (
    "id" TEXT NOT NULL,
    "retailerProfileId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "whatsapp" TEXT,
    "totalDesigns" INTEGER NOT NULL,
    "totalSets" INTEGER NOT NULL,
    "totalPieces" INTEGER NOT NULL,
    "cartSubtotal" DECIMAL(10,2) NOT NULL,
    "preferredDate" TEXT,
    "preferredTime" TEXT,
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "assignedToUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerContactRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "retailerProfileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sets" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderEnquiry" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "retailerProfileId" TEXT NOT NULL,
    "retailerBusinessName" TEXT NOT NULL,
    "retailerApplicantName" TEXT NOT NULL,
    "retailerGstin" TEXT,
    "retailerContact" TEXT NOT NULL,
    "retailerEmail" TEXT NOT NULL,
    "billingAddressJson" TEXT NOT NULL,
    "shippingAddressJson" TEXT NOT NULL,
    "totalDesigns" INTEGER NOT NULL,
    "totalSets" INTEGER NOT NULL,
    "totalPieces" INTEGER NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "totalGst" DECIMAL(12,2) NOT NULL,
    "shipping" DECIMAL(10,2) NOT NULL,
    "masterTotal" DECIMAL(12,2) NOT NULL,
    "status" "OrderEnquiryStatus" NOT NULL DEFAULT 'ENQUIRY_RECEIVED',
    "customerRemarks" TEXT,
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderEnquiryId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "billingEntityId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "designNumber" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "piecesPerSet" INTEGER NOT NULL,
    "totalPieces" INTEGER NOT NULL,
    "pieceRate" DECIMAL(10,2) NOT NULL,
    "setRate" DECIMAL(10,2) NOT NULL,
    "lineSubtotal" DECIMAL(12,2) NOT NULL,
    "hsn" TEXT NOT NULL,
    "gstRate" DECIMAL(5,2) NOT NULL,
    "gstAmount" DECIMAL(10,2) NOT NULL,
    "totalWithGst" DECIMAL(12,2) NOT NULL,
    "imageUrl" TEXT,
    "color" TEXT NOT NULL,
    "sizeCombination" TEXT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderEnquiryId" TEXT NOT NULL,
    "status" "OrderEnquiryStatus" NOT NULL,
    "actorUserId" TEXT,
    "actorName" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estimate" (
    "id" TEXT NOT NULL,
    "estimateNumber" TEXT NOT NULL,
    "orderEnquiryId" TEXT NOT NULL,
    "billingEntityId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "totalSets" INTEGER NOT NULL,
    "totalPieces" INTEGER NOT NULL,
    "taxableSubtotal" DECIMAL(12,2) NOT NULL,
    "isInterState" BOOLEAN NOT NULL DEFAULT false,
    "cgstAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sgstAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "igstAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalGst" DECIMAL(10,2) NOT NULL,
    "shippingCharge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(12,2) NOT NULL,
    "pdfMediaAssetId" TEXT,
    "paymentTermsJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstimateAccessToken" (
    "id" TEXT NOT NULL,
    "estimateId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstimateAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "internalName" TEXT NOT NULL DEFAULT 'Kurta Campaign',
    "slideNumber" TEXT NOT NULL DEFAULT '01',
    "navLabel" TEXT NOT NULL DEFAULT 'New Arrivals',
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "desktopAssetId" TEXT,
    "mobileAssetId" TEXT,
    "desktopImageUrl" TEXT NOT NULL,
    "mobileImageUrl" TEXT,
    "imageAlt" TEXT NOT NULL,
    "primaryCtaLabel" TEXT NOT NULL DEFAULT 'SHOP NEW ARRIVALS',
    "primaryCtaUrl" TEXT NOT NULL DEFAULT '/collections',
    "secondaryCtaLabel" TEXT,
    "secondaryCtaUrl" TEXT,
    "contentPosition" "HeroContentPosition" NOT NULL DEFAULT 'LEFT',
    "textTheme" "HeroTextTheme" NOT NULL DEFAULT 'LIGHT',
    "desktopImagePosition" TEXT NOT NULL DEFAULT 'center 25%',
    "mobileImagePosition" TEXT NOT NULL DEFAULT '60% 20%',
    "linkedProductId" TEXT,
    "linkedCategoryId" TEXT,
    "linkedCollectionId" TEXT,
    "fabricTagsJson" TEXT,
    "editorialBadge" TEXT DEFAULT 'Direct Factory Archive',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "HeroSlideStatus" NOT NULL DEFAULT 'PUBLISHED',
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSlideVersion" (
    "id" TEXT NOT NULL,
    "heroSlideId" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HeroSlideVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'LOCAL',
    "bucket" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "visibility" "MediaVisibility" NOT NULL DEFAULT 'PUBLIC',
    "mimeType" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "fileExtension" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "aspectRatio" DECIMAL(5,2),
    "altText" TEXT,
    "mediaType" TEXT NOT NULL DEFAULT 'HERO_DESKTOP',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorEmail" TEXT,
    "actorRole" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadataJson" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RetailerProfile_userId_key" ON "RetailerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RetailerProfile_gstin_key" ON "RetailerProfile"("gstin");

-- CreateIndex
CREATE INDEX "RetailerProfile_businessName_idx" ON "RetailerProfile"("businessName");

-- CreateIndex
CREATE INDEX "RetailerProfile_status_idx" ON "RetailerProfile"("status");

-- CreateIndex
CREATE INDEX "RetailerProfile_gstin_idx" ON "RetailerProfile"("gstin");

-- CreateIndex
CREATE INDEX "RetailerAddress_retailerProfileId_idx" ON "RetailerAddress"("retailerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "RetailerClassification_code_key" ON "RetailerClassification"("code");

-- CreateIndex
CREATE INDEX "KYCApplication_retailerProfileId_idx" ON "KYCApplication"("retailerProfileId");

-- CreateIndex
CREATE INDEX "KYCApplication_status_idx" ON "KYCApplication"("status");

-- CreateIndex
CREATE INDEX "KYCApplication_gstin_idx" ON "KYCApplication"("gstin");

-- CreateIndex
CREATE INDEX "KYCDocument_applicationId_idx" ON "KYCDocument"("applicationId");

-- CreateIndex
CREATE INDEX "KYCActivity_applicationId_idx" ON "KYCActivity"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingEntity_code_key" ON "BillingEntity"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BillingEntity_gstin_key" ON "BillingEntity"("gstin");

-- CreateIndex
CREATE UNIQUE INDEX "GSTConfiguration_billingEntityId_hsnCode_key" ON "GSTConfiguration"("billingEntityId", "hsnCode");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_billingEntityId_idx" ON "Category"("billingEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_slug_key" ON "Subcategory"("slug");

-- CreateIndex
CREATE INDEX "Subcategory_categoryId_idx" ON "Subcategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- CreateIndex
CREATE INDEX "Collection_slug_idx" ON "Collection"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_designNumber_idx" ON "Product"("designNumber");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_collectionId_idx" ON "Product"("collectionId");

-- CreateIndex
CREATE INDEX "ProductMedia_productId_idx" ON "ProductMedia"("productId");

-- CreateIndex
CREATE INDEX "StockAdjustment_productId_idx" ON "StockAdjustment"("productId");

-- CreateIndex
CREATE INDEX "StockReservation_productId_idx" ON "StockReservation"("productId");

-- CreateIndex
CREATE INDEX "StockReservation_orderEnquiryId_idx" ON "StockReservation"("orderEnquiryId");

-- CreateIndex
CREATE INDEX "MOQRule_scope_idx" ON "MOQRule"("scope");

-- CreateIndex
CREATE INDEX "MOQOverride_retailerProfileId_idx" ON "MOQOverride"("retailerProfileId");

-- CreateIndex
CREATE INDEX "SellerContactRequest_retailerProfileId_idx" ON "SellerContactRequest"("retailerProfileId");

-- CreateIndex
CREATE INDEX "SellerContactRequest_status_idx" ON "SellerContactRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_retailerProfileId_key" ON "Cart"("retailerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON "CartItem"("cartId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderEnquiry_orderNumber_key" ON "OrderEnquiry"("orderNumber");

-- CreateIndex
CREATE INDEX "OrderEnquiry_orderNumber_idx" ON "OrderEnquiry"("orderNumber");

-- CreateIndex
CREATE INDEX "OrderEnquiry_retailerProfileId_idx" ON "OrderEnquiry"("retailerProfileId");

-- CreateIndex
CREATE INDEX "OrderEnquiry_status_idx" ON "OrderEnquiry"("status");

-- CreateIndex
CREATE INDEX "OrderItem_orderEnquiryId_idx" ON "OrderItem"("orderEnquiryId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_orderEnquiryId_idx" ON "OrderStatusHistory"("orderEnquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "Estimate_estimateNumber_key" ON "Estimate"("estimateNumber");

-- CreateIndex
CREATE INDEX "Estimate_estimateNumber_idx" ON "Estimate"("estimateNumber");

-- CreateIndex
CREATE INDEX "Estimate_orderEnquiryId_idx" ON "Estimate"("orderEnquiryId");

-- CreateIndex
CREATE INDEX "Estimate_billingEntityId_idx" ON "Estimate"("billingEntityId");

-- CreateIndex
CREATE UNIQUE INDEX "EstimateAccessToken_token_key" ON "EstimateAccessToken"("token");

-- CreateIndex
CREATE INDEX "EstimateAccessToken_token_idx" ON "EstimateAccessToken"("token");

-- CreateIndex
CREATE INDEX "HeroSlide_status_idx" ON "HeroSlide"("status");

-- CreateIndex
CREATE INDEX "HeroSlide_sortOrder_idx" ON "HeroSlide"("sortOrder");

-- CreateIndex
CREATE INDEX "HeroSlide_startAt_idx" ON "HeroSlide"("startAt");

-- CreateIndex
CREATE INDEX "HeroSlide_endAt_idx" ON "HeroSlide"("endAt");

-- CreateIndex
CREATE INDEX "HeroSlideVersion_heroSlideId_idx" ON "HeroSlideVersion"("heroSlideId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_storageKey_key" ON "MediaAsset"("storageKey");

-- CreateIndex
CREATE INDEX "MediaAsset_storageKey_idx" ON "MediaAsset"("storageKey");

-- CreateIndex
CREATE INDEX "MediaAsset_visibility_idx" ON "MediaAsset"("visibility");

-- CreateIndex
CREATE INDEX "MediaAsset_mediaType_idx" ON "MediaAsset"("mediaType");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- CreateIndex
CREATE INDEX "SiteSetting_key_idx" ON "SiteSetting"("key");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailerProfile" ADD CONSTRAINT "RetailerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailerProfile" ADD CONSTRAINT "RetailerProfile_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "RetailerClassification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetailerAddress" ADD CONSTRAINT "RetailerAddress_retailerProfileId_fkey" FOREIGN KEY ("retailerProfileId") REFERENCES "RetailerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCApplication" ADD CONSTRAINT "KYCApplication_retailerProfileId_fkey" FOREIGN KEY ("retailerProfileId") REFERENCES "RetailerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCDocument" ADD CONSTRAINT "KYCDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "KYCApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCDocument" ADD CONSTRAINT "KYCDocument_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYCActivity" ADD CONSTRAINT "KYCActivity_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "KYCApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GSTConfiguration" ADD CONSTRAINT "GSTConfiguration_billingEntityId_fkey" FOREIGN KEY ("billingEntityId") REFERENCES "BillingEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_billingEntityId_fkey" FOREIGN KEY ("billingEntityId") REFERENCES "BillingEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_gstConfigId_fkey" FOREIGN KEY ("gstConfigId") REFERENCES "GSTConfiguration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_orderEnquiryId_fkey" FOREIGN KEY ("orderEnquiryId") REFERENCES "OrderEnquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MOQRule" ADD CONSTRAINT "MOQRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MOQRule" ADD CONSTRAINT "MOQRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MOQOverride" ADD CONSTRAINT "MOQOverride_retailerProfileId_fkey" FOREIGN KEY ("retailerProfileId") REFERENCES "RetailerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerContactRequest" ADD CONSTRAINT "SellerContactRequest_retailerProfileId_fkey" FOREIGN KEY ("retailerProfileId") REFERENCES "RetailerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_retailerProfileId_fkey" FOREIGN KEY ("retailerProfileId") REFERENCES "RetailerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEnquiry" ADD CONSTRAINT "OrderEnquiry_retailerProfileId_fkey" FOREIGN KEY ("retailerProfileId") REFERENCES "RetailerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderEnquiryId_fkey" FOREIGN KEY ("orderEnquiryId") REFERENCES "OrderEnquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderEnquiryId_fkey" FOREIGN KEY ("orderEnquiryId") REFERENCES "OrderEnquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_orderEnquiryId_fkey" FOREIGN KEY ("orderEnquiryId") REFERENCES "OrderEnquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_billingEntityId_fkey" FOREIGN KEY ("billingEntityId") REFERENCES "BillingEntity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_pdfMediaAssetId_fkey" FOREIGN KEY ("pdfMediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstimateAccessToken" ADD CONSTRAINT "EstimateAccessToken_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_desktopAssetId_fkey" FOREIGN KEY ("desktopAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_mobileAssetId_fkey" FOREIGN KEY ("mobileAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_linkedProductId_fkey" FOREIGN KEY ("linkedProductId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_linkedCategoryId_fkey" FOREIGN KEY ("linkedCategoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_linkedCollectionId_fkey" FOREIGN KEY ("linkedCollectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSlideVersion" ADD CONSTRAINT "HeroSlideVersion_heroSlideId_fkey" FOREIGN KEY ("heroSlideId") REFERENCES "HeroSlide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
