import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff, requireVendor } from "@/lib/auth/guard";


const PENDING_KYC_STATUSES = [
  "APPLICATION_RECEIVED",
  "UNDER_REVIEW",
  "ADDITIONAL_INFORMATION_REQUIRED",
] as const;

export async function GET(request: NextRequest) {
  try {
    const staff = await requireStaff(request);

    if (!("error" in staff)) {
      const [pendingKyc, newOrders, pendingSampleCalls] = await Promise.all([
        prisma.kYCApplication.count({
          where: { status: { in: [...PENDING_KYC_STATUSES] } },
        }),
        prisma.orderEnquiry.count({
          where: {
            sellerOrders: { some: { vendorId: null, status: "ENQUIRY_RECEIVED" } },
          },
        }),
        prisma.sellerContactRequest.count({
          where: { status: "pending", product: { vendorId: null } },
        }),
      ]);

      return NextResponse.json({
        success: true,
        data: { pendingKyc, newOrders, pendingSampleCalls },
      });
    }

    const vendor = await requireVendor(request);

    if (!("error" in vendor)) {
      const vendorId = vendor.vendorProfile.id;

      const [newOrders, pendingSampleCalls] = await Promise.all([
        // One SellerOrder per (order, vendor), so this equals the number of distinct orders.
        prisma.sellerOrder.count({
          where: { vendorId, status: "ENQUIRY_RECEIVED" },
        }),
        prisma.sellerContactRequest.count({
          where: { status: "pending", product: { vendorId } },
        }),
      ]);

      // Vendors have no KYC queue, so that count is always 0 for them.
      return NextResponse.json({
        success: true,
        data: { pendingKyc: 0, newOrders, pendingSampleCalls },
      });
    }

    return NextResponse.json(
      { success: false, error: "Admin or vendor access required." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Sidebar counts error:", error);
    return NextResponse.json(
      { success: false, error: "Could not load sidebar counts." },
      { status: 500 }
    );
  }
}