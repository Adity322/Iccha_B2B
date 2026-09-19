import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/guard";

const optionalText = z.string().trim().optional().or(z.literal(""));

const promoteSchema = z.object({
  contactName: optionalText,
  mobile: optionalText,
  gstin: z.string().trim().min(1, "GSTIN is required for a vendor account"),
  pan: optionalText,
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  stateCode: z.string().trim().min(1, "State code is required"),
  bankName: optionalText,
  accountHolder: optionalText,
  accountNumber: optionalText,
  ifsc: optionalText,
  branch: optionalText,
  upiId: optionalText,
});

/**
 * GET — returns everything the "Promote to Vendor" form needs, so the admin
 * doesn't have to retype anything.
 *
 * Priority for each field:
 *   1. A previous vendor profile (the user was promoted and later demoted) —
 *      this is the only place bank details live.
 *   2. The retailer profile / latest KYC application / default address.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff(request);
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
  }

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        retailerProfile: {
          include: {
            // Default address first, then the oldest one as a fallback
            addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }], take: 1 },
            kycApplications: { orderBy: { submittedAt: "desc" }, take: 1 },
          },
        },
        vendorProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const rp = user.retailerProfile;
    const vp = user.vendorProfile;
    const addr = rp?.addresses[0];
    const kyc = rp?.kycApplications[0];

    const retailerAddressLine = addr ? [addr.street, addr.area].filter(Boolean).join(", ") : "";

    return NextResponse.json({
      success: true,
      data: {
        businessName: vp?.businessName || rp?.businessName || "",
        // true when a dormant vendor profile exists (demoted earlier)
        returningVendor: Boolean(vp),
        form: {
          contactName: vp?.contactName || rp?.applicantName || user.name || "",
          mobile: vp?.mobile || rp?.mobile || user.mobile || "",
          gstin: vp?.gstin || rp?.gstin || kyc?.gstin || "",
          pan: vp?.pan || rp?.pan || kyc?.pan || "",
          address: vp?.address || retailerAddressLine,
          city: vp?.city || addr?.city || "",
          state: vp?.state || addr?.state || "",
          stateCode: vp?.stateCode || addr?.stateCode || "",
          bankName: vp?.bankName || "",
          accountHolder: vp?.accountHolder || "",
          accountNumber: vp?.accountNumber || "",
          ifsc: vp?.ifsc || "",
          branch: vp?.branch || "",
          upiId: vp?.upiId || "",
        },
      },
    });
  } catch (error) {
    console.error("Promote prefill error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load account details" },
      { status: 500 }
    );
  }
}

/**
 * PATCH — promotes a retailer to vendor.
 *
 * If the user was a vendor before (demote keeps the VendorProfile and its
 * BillingEntity, only flipping isActive=false), we REACTIVATE that profile
 * instead of creating a new one. Creating again would violate the unique
 * constraints on userId / vendorCode / gstin / BillingEntity.code, and would
 * also orphan the vendor's existing products and order history.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff(request);
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
  }

  const { id } = await params;

  const body = await request.json();
  const parsed = promoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { retailerProfile: true, vendorProfile: true },
  });

  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  // Only a *current* vendor is blocked. A demoted user still has a dormant
  // (inactive) vendorProfile row, but their role is RETAILER again.
  if (user.role === "VENDOR") {
    return NextResponse.json({ success: false, error: "This user is already a vendor" }, { status: 409 });
  }

  if (user.role !== "RETAILER" || !user.retailerProfile) {
    return NextResponse.json({ success: false, error: "Only retailer accounts can be promoted to vendor" }, { status: 400 });
  }

  const data = parsed.data;
  const rp = user.retailerProfile;
  const existingVendor = user.vendorProfile;
  const gstin = data.gstin.toUpperCase();

  const vendorFields = {
    businessName: existingVendor?.businessName || rp.businessName,
    contactName: data.contactName || existingVendor?.contactName || rp.applicantName,
    mobile: data.mobile || existingVendor?.mobile || rp.mobile,
    gstin,
    pan: data.pan || existingVendor?.pan || rp.pan || null,
    address: data.address,
    city: data.city,
    state: data.state,
    stateCode: data.stateCode,
    bankName: data.bankName || null,
    accountHolder: data.accountHolder || null,
    accountNumber: data.accountNumber || null,
    ifsc: data.ifsc || null,
    branch: data.branch || null,
    upiId: data.upiId || null,
  };

  try {
    await prisma.$transaction(async (tx) => {
      const vendor = existingVendor
        ? await tx.vendorProfile.update({
            where: { id: existingVendor.id },
            data: { ...vendorFields, isActive: true },
          })
        : await tx.vendorProfile.create({
            data: {
              vendorCode: `VEN-${user.id}`,
              userId: user.id,
              ...vendorFields,
            },
          });

      await tx.user.update({
        where: { id: user.id },
        data: { role: "VENDOR" },
      });

      const entityFields = {
        legalName: vendor.businessName,
        tradeName: vendor.businessName,
        gstin: vendor.gstin,
        pan: vendor.pan || "",
        state: vendor.state,
        stateCode: vendor.stateCode,
        registeredAddress: [vendor.address, vendor.city, vendor.state].filter(Boolean).join(", "),
        contactEmail: user.email,
        contactPhone: vendor.mobile,
        bankName: vendor.bankName || "",
        accountHolder: vendor.accountHolder || "",
        accountNumber: vendor.accountNumber || "",
        ifsc: vendor.ifsc || "",
        branch: vendor.branch || "",
        upiId: vendor.upiId || null,
        isActive: true,
      };

      // upsert: a returning vendor already has this entity from their first
      // promotion; a brand-new vendor gets it created.
      await tx.billingEntity.upsert({
        where: { code: `vendor:${vendor.vendorCode}` },
        update: entityFields,
        create: {
          code: `vendor:${vendor.vendorCode}`,
          ...entityFields,
          estimatePrefix: `EST-${vendor.vendorCode}-`,
          invoicePrefix: vendor.invoicePrefix,
          defaultGstRate: vendor.defaultGstRate,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: existingVendor
        ? "Vendor account reactivated with their previous products and history"
        : "User promoted to vendor",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = String(error.meta?.target ?? "");
      return NextResponse.json(
        {
          success: false,
          error: target.includes("gstin")
            ? "This GSTIN is already registered to another vendor"
            : "One of these values is already in use by another vendor account",
        },
        { status: 409 }
      );
    }
    console.error("Promote to vendor error:", error);
    return NextResponse.json({ success: false, error: "Failed to promote user" }, { status: 500 });
  }
}