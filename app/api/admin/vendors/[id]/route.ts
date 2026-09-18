import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/guard";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff(request);
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
  }

  const { id } = await params;

  const vendor = await prisma.vendorProfile.findUnique({
    where: { id },
    select: { id: true, userId: true, businessName: true },
  });

  if (!vendor) {
    return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });
  }

  const [productCount, sellerOrderCount, orderCount] = await Promise.all([
    prisma.product.count({ where: { vendorId: id } }),
    prisma.sellerOrder.count({ where: { vendorId: id } }),
    prisma.orderEnquiry.count({
      where: { sellerOrders: { some: { vendorId: id } } },
    }),
  ]);

  if (productCount || sellerOrderCount || orderCount) {
    return NextResponse.json(
      {
        success: false,
        error: "This vendor has product or order history and cannot be permanently deleted. Demote the vendor to retailer instead.",
      },
      { status: 409 }
    );
  }

  try {
    await prisma.user.delete({ where: { id: vendor.userId } });
    return NextResponse.json({ success: true, message: `${vendor.businessName} deleted.` });
  } catch (error) {
    console.error("Delete vendor error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete vendor" },
      { status: 500 }
    );
  }
}
