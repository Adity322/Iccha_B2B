import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/guard";

export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
  }

  const retailers = await prisma.retailerProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      addresses: { where: { isDefault: true }, take: 1 },
      moqOverrides: {
        where: { isUsed: false },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: retailers.map((r) => {
      const activeOverride = r.moqOverrides[0] || null;
      const address = r.addresses[0] || null;
      return {
        id: r.id,
        businessName: r.businessName,
        applicantName: r.applicantName,
        mobile: r.mobile,
        gstin: r.gstin,
        status: r.status,
        businessType: r.businessType,
        city: address?.city || null,
        state: address?.state || null,
        moqOverride: !!activeOverride,
        customMoqSets: activeOverride?.permittedMinSets ?? null,
      };
    }),
  });
}