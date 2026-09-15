import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/guard";

const moqSchema = z.object({
  permittedMinSets: z.number().int().min(1).nullable(), // null = reset to default
  reason: z.string().optional(),
});

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
  const parsed = moqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const retailer = await prisma.retailerProfile.findUnique({ where: { id } });
  if (!retailer) {
    return NextResponse.json({ success: false, error: "Retailer not found" }, { status: 404 });
  }

  const { permittedMinSets, reason } = parsed.data;

  // Deactivate any currently active override first, either way
  await prisma.mOQOverride.updateMany({
    where: { retailerProfileId: id, isUsed: false },
    data: { isUsed: true },
  });

  if (permittedMinSets !== null) {
    await prisma.mOQOverride.create({
      data: {
        retailerProfileId: id,
        approvedByUserId: guard.user.id,
        permittedMinSets,
        reason: reason || `Set to ${permittedMinSets} set(s) via admin panel`,
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: { moqOverride: permittedMinSets !== null, customMoqSets: permittedMinSets },
  });
}