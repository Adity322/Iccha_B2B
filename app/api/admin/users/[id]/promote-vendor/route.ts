import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/guard";

const promoteSchema = z.object({
  contactName: z.string().optional(),
  gstin: z.string().min(1, "GSTIN is required for a vendor account"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  stateCode: z.string().min(1, "State code is required"),
  bankName: z.string().optional(),
  accountHolder: z.string().optional(),
  accountNumber: z.string().optional(),
  ifsc: z.string().optional(),
  branch: z.string().optional(),
  upiId: z.string().optional(),
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
  const parsed = promoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { retailerProfile: true, vendorProfile: true },
  });

  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  if (user.role === "VENDOR" || user.vendorProfile) {
    return NextResponse.json({ success: false, error: "This user is already a vendor" }, { status: 409 });
  }

  if (user.role !== "RETAILER" || !user.retailerProfile) {
    return NextResponse.json({ success: false, error: "Only retailer accounts can be promoted to vendor" }, { status: 400 });
  }

  const data = parsed.data;
  const rp = user.retailerProfile;

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { role: "VENDOR" },
      }),
      prisma.vendorProfile.create({
        data: {
          userId: user.id,
          businessName: rp.businessName,
          contactName: data.contactName || rp.applicantName,
          mobile: rp.mobile,
          gstin: data.gstin,
          pan: rp.pan,
          address: data.address,
          city: data.city,
          state: data.state,
          stateCode: data.stateCode,
          bankName: data.bankName || null,
          accountHolder: data.accountHolder || null,
          accountNumber: data.accountNumber || null,
          ifsc: data.ifsc || null,
          branch: data.branch || null,
          upiId: data.upiId || null,
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "User promoted to vendor" });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "This GSTIN is already registered to another vendor" },
        { status: 409 }
      );
    }
    console.error("Promote to vendor error:", error);
    return NextResponse.json({ success: false, error: "Failed to promote user" }, { status: 500 });
  }
}