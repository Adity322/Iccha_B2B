/*
  Safe migration:
  Convert SellerOrder and SellerOrderStatusHistory status columns
  from OrderEnquiryStatus to SellerOrderStatus without losing data.
*/

-- Create the new enum
CREATE TYPE "SellerOrderStatus" AS ENUM (
  'ENQUIRY_RECEIVED',
  'PROCESSING',
  'READY_FOR_DISPATCH',
  'DISPATCHED',
  'CANCELLED'
);

-- ============================================================
-- SellerOrder
-- ============================================================

-- Remove the old enum default BEFORE changing the column type.
ALTER TABLE "SellerOrder"
ALTER COLUMN "status" DROP DEFAULT;

-- Convert the existing enum column to TEXT.
ALTER TABLE "SellerOrder"
ALTER COLUMN "status" TYPE TEXT
USING "status"::TEXT;

-- Map old statuses into the new five-status workflow.
UPDATE "SellerOrder"
SET "status" = CASE
  WHEN "status" = 'UNDER_REVIEW'
    THEN 'ENQUIRY_RECEIVED'

  WHEN "status" = 'SELLER_CONTACTED'
    THEN 'ENQUIRY_RECEIVED'

  WHEN "status" = 'ESTIMATE_GENERATED'
    THEN 'ENQUIRY_RECEIVED'

  WHEN "status" = 'CONFIRMED'
    THEN 'PROCESSING'

  WHEN "status" = 'AWAITING_PAYMENT'
    THEN 'PROCESSING'

  WHEN "status" = 'COMPLETED'
    THEN 'DISPATCHED'

  ELSE "status"
END;

-- Convert the column to the new enum.
ALTER TABLE "SellerOrder"
ALTER COLUMN "status"
TYPE "SellerOrderStatus"
USING "status"::"SellerOrderStatus";

-- Add the new default.
ALTER TABLE "SellerOrder"
ALTER COLUMN "status"
SET DEFAULT 'ENQUIRY_RECEIVED'::"SellerOrderStatus";

-- ============================================================
-- SellerOrderStatusHistory
-- ============================================================

-- There should be no old default here, but explicitly remove one
-- if PostgreSQL has one.
ALTER TABLE "SellerOrderStatusHistory"
ALTER COLUMN "status" DROP DEFAULT;

-- Convert existing history status to TEXT.
ALTER TABLE "SellerOrderStatusHistory"
ALTER COLUMN "status" TYPE TEXT
USING "status"::TEXT;

-- Map old historical statuses.
UPDATE "SellerOrderStatusHistory"
SET "status" = CASE
  WHEN "status" = 'UNDER_REVIEW'
    THEN 'ENQUIRY_RECEIVED'

  WHEN "status" = 'SELLER_CONTACTED'
    THEN 'ENQUIRY_RECEIVED'

  WHEN "status" = 'ESTIMATE_GENERATED'
    THEN 'ENQUIRY_RECEIVED'

  WHEN "status" = 'CONFIRMED'
    THEN 'PROCESSING'

  WHEN "status" = 'AWAITING_PAYMENT'
    THEN 'PROCESSING'

  WHEN "status" = 'COMPLETED'
    THEN 'DISPATCHED'

  ELSE "status"
END;

-- Convert history status to the new enum.
ALTER TABLE "SellerOrderStatusHistory"
ALTER COLUMN "status"
TYPE "SellerOrderStatus"
USING "status"::"SellerOrderStatus";
