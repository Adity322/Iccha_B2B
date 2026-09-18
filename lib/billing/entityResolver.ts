import { prisma } from "@/lib/db";

const PLATFORM_BILLING_ENTITY_CODE =
  process.env.PLATFORM_BILLING_ENTITY_CODE || "platform";

/**
 * Creates or synchronises the BillingEntity that represents a vendor.
 * VendorProfile is the source of truth for the vendor's legal/GST data.
 */
export async function syncVendorBillingEntity(vendorId: string) {
  const vendor = await prisma.vendorProfile.findUnique({
    where: { id: vendorId },
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  if (!vendor) {
    throw new Error("Vendor not found.");
  }

  const code = `vendor:${vendor.vendorCode}`;

  return prisma.billingEntity.upsert({
    where: { code },
    update: {
      legalName: vendor.businessName,
      tradeName: vendor.businessName,
      gstin: vendor.gstin,
      pan: vendor.pan || "",
      state: vendor.state,
      stateCode: vendor.stateCode,
      registeredAddress: [vendor.address, vendor.city, vendor.state]
        .filter(Boolean)
        .join(", "),
      contactEmail: vendor.user.email,
      contactPhone: vendor.mobile,
      bankName: vendor.bankName || "",
      accountHolder: vendor.accountHolder || "",
      accountNumber: vendor.accountNumber || "",
      ifsc: vendor.ifsc || "",
      branch: vendor.branch || "",
      upiId: vendor.upiId || null,
      estimatePrefix: `EST-${vendor.vendorCode}-`,
      invoicePrefix: vendor.invoicePrefix,
      defaultGstRate: vendor.defaultGstRate,
      isActive: vendor.isActive,
    },
    create: {
      code,
      legalName: vendor.businessName,
      tradeName: vendor.businessName,
      gstin: vendor.gstin,
      pan: vendor.pan || "",
      state: vendor.state,
      stateCode: vendor.stateCode,
      registeredAddress: [vendor.address, vendor.city, vendor.state]
        .filter(Boolean)
        .join(", "),
      contactEmail: vendor.user.email,
      contactPhone: vendor.mobile,
      bankName: vendor.bankName || "",
      accountHolder: vendor.accountHolder || "",
      accountNumber: vendor.accountNumber || "",
      ifsc: vendor.ifsc || "",
      branch: vendor.branch || "",
      upiId: vendor.upiId || null,
      estimatePrefix: `EST-${vendor.vendorCode}-`,
      invoicePrefix: vendor.invoicePrefix,
      defaultGstRate: vendor.defaultGstRate,
      isActive: vendor.isActive,
    },
  });
}

/**
 * Resolves the BillingEntity for a product.
 * - Vendor product: always use that vendor's BillingEntity.
 * - Admin/house product: use the configured platform BillingEntity.
 */
export async function resolveProductBillingEntityId(
  vendorId: string | null
): Promise<string> {
  if (vendorId) {
    const entity = await syncVendorBillingEntity(vendorId);
    return entity.id;
  }

  const platform = await prisma.billingEntity.findFirst({
    where: {
      code: PLATFORM_BILLING_ENTITY_CODE,
      isActive: true,
    },
    select: { id: true },
  });

  if (!platform) {
    throw new Error(
      `Platform billing entity '${PLATFORM_BILLING_ENTITY_CODE}' is not configured.`
    );
  }

  return platform.id;
}
