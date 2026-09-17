import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff, requireVendor } from "@/lib/auth/guard";

export async function GET(request: NextRequest) {
  try {
    const staff = await requireStaff(request);

    if (!("error" in staff)) {
      const count = await prisma.orderEnquiry.count({
        where: {
          status: "ENQUIRY_RECEIVED",
        },
      });

      return NextResponse.json({
        success: true,
        count,
      });
    }

    const vendor = await requireVendor(request);

    if (!("error" in vendor)) {
      const count = await prisma.orderEnquiry.count({
        where: {
          status: "ENQUIRY_RECEIVED",
          items: {
            some: {
              product: {
                vendorId: vendor.vendorProfile.id,
              },
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        count,
      });
    }

    return NextResponse.json(
      { success: false, error: "Admin or vendor access required." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Get new order enquiry count error:", error);

    return NextResponse.json(
      { success: false, error: "Could not load new order enquiry count." },
      { status: 500 }
    );
  }
}
