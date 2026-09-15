-- DropForeignKey
ALTER TABLE "public"."Category" DROP CONSTRAINT "Category_billingEntityId_fkey";

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "billingEntityId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_billingEntityId_fkey" FOREIGN KEY ("billingEntityId") REFERENCES "BillingEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
