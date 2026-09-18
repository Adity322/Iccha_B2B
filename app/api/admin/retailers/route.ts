import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/guard";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const search = searchParams.get("search")?.trim();

  const retailers = await prisma.retailerProfile.findMany({
    where: {
      user: { role: "RETAILER" },
      ...(search
        ? {
            OR: [
              { businessName: { contains: search, mode: "insensitive" } },
              { applicantName: { contains: search, mode: "insensitive" } },
              { gstin: { contains: search, mode: "insensitive" } },
              { mobile: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      user: { select: { isActive: true } },
      addresses: { where: { isDefault: true }, take: 1 },
      moqOverrides: {
        where: { isUsed: false },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const hasMore = retailers.length > PAGE_SIZE;
  const page = hasMore ? retailers.slice(0, PAGE_SIZE) : retailers;

  return NextResponse.json({
    success: true,
    data: page.map((r) => {
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
        isActive: r.user.isActive,
      };
    }),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  });
}
