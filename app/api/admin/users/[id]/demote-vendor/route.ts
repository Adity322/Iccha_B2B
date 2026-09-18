import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/guard";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireStaff(request);
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { retailerProfile: true, vendorProfile: true },
  });

  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  if (user.role !== "VENDOR" || !user.vendorProfile) {
    return NextResponse.json(
      { success: false, error: "This user is not currently a vendor" },
      { status: 400 }
    );
  }

  if (!user.retailerProfile) {
    return NextResponse.json(
      {
        success: false,
        error: "This account has no retailer profile to fall back to and cannot be demoted",
      },
      { status: 400 }
    );
  }

  const activeProductCount = await prisma.product.count({
    where: { vendorId: user.vendorProfile.id, isActive: true },
  });

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { role: "RETAILER" },
      }),
      // Deactivate rather than delete: preserves order/product history that
      // still references this vendor profile, and keeps gstin/vendorCode
      // uniqueness intact in case the account is ever re-promoted.
      prisma.vendorProfile.update({
        where: { id: user.vendorProfile.id },
        data: { isActive: false },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message:
        activeProductCount > 0
          ? `User demoted to retailer. Note: ${activeProductCount} active product${
              activeProductCount === 1 ? "" : "s"
            } still reference this vendor and are no longer manageable via vendor login.`
          : "User demoted to retailer.",
    });
  } catch (error) {
    console.error("Demote vendor error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to demote user" },
      { status: 500 }
    );
  }
}