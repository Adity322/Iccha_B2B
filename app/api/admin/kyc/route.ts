import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/guard";

export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
  }

  const applications = await prisma.kYCApplication.findMany({
    orderBy: { submittedAt: "desc" },
    include: {
      documents: true,
      retailerProfile: { select: { businessName: true, businessType: true } },
    },
  });

  return NextResponse.json({
    success: true,
    data: applications.map((app) => ({
      id: app.id,
      status: app.status,
      businessName: app.businessName,
      applicantName: app.applicantName,
      mobile: app.mobile,
      email: app.email,
      gstin: app.gstin,
      pan: app.pan,
      businessType: app.retailerProfile?.businessType,
      submittedAt: app.submittedAt,
      reviewedAt: app.reviewedAt,
      rejectionReason: app.rejectionReason,
      infoRequestNotes: app.infoRequestNotes,
      documents: app.documents.map((d) => ({
        id: d.id,
        name: d.originalFilename,
        type: d.documentType,
        size: `${(d.fileSize / (1024 * 1024)).toFixed(2)} MB`,
      })),
    })),
  });
}