import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/guard";

const reviewSchema = z.object({
  action: z.enum(["approve", "reject", "request_info"]),
  notes: z.string().optional(),
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
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { action, notes } = parsed.data;

  const application = await prisma.kYCApplication.findUnique({
    where: { id },
    include: { retailerProfile: true },
  });

  if (!application) {
    return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
  }

  const statusMap = {
    approve: "APPROVED",
    reject: "REJECTED",
    request_info: "ADDITIONAL_INFORMATION_REQUIRED",
  } as const;

  const activityActionMap = {
    approve: "APPROVED",
    reject: "REJECTED",
    request_info: "INFO_REQUESTED",
  } as const;

  const newStatus = statusMap[action];

  const [updatedApplication] = await prisma.$transaction([
    prisma.kYCApplication.update({
      where: { id: application.id },
      data: {
        status: newStatus,
        reviewedByUserId: guard.user.id,
        reviewedAt: new Date(),
        rejectionReason: action === "reject" ? notes || null : application.rejectionReason,
        infoRequestNotes: action === "request_info" ? notes || null : application.infoRequestNotes,
        activities: {
          create: {
            actorUserId: guard.user.id,
            actorName: guard.user.name,
            action: activityActionMap[action],
            notes: notes || null,
          },
        },
      },
    }),
    prisma.retailerProfile.update({
      where: { id: application.retailerProfileId },
      data: { status: newStatus },
    }),
  ]);

  return NextResponse.json({ success: true, data: { status: updatedApplication.status } });
}