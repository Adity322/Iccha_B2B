import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/guard";

export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
  }

  const users = await prisma.user.findMany({
    where: { role: { in: ["RETAILER", "VENDOR"] } },
    orderBy: { createdAt: "desc" },
    include: {
      retailerProfile: { select: { businessName: true, status: true, gstin: true, businessType: true } },
      vendorProfile: { select: { businessName: true, gstin: true, isActive: true } },
    },
  });

  return NextResponse.json({
    success: true,
    data: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      businessName: u.vendorProfile?.businessName || u.retailerProfile?.businessName || null,
      retailerStatus: u.retailerProfile?.status || null,
      businessType: u.retailerProfile?.businessType || null,
      gstin: u.vendorProfile?.gstin || u.retailerProfile?.gstin || null,
      vendorActive: u.vendorProfile?.isActive ?? null,
    })),
  });
}