import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { requireStaff, requireVendor } from "@/lib/auth/guard";

const SESSION_TTL_MINUTES = 15;

async function authenticateEither(request: NextRequest) {
  const staffResult = await requireStaff(request);
  if (!("error" in staffResult)) {
    return { kind: "staff" as const, ...staffResult };
  }

  const vendorResult = await requireVendor(request);
  if (!("error" in vendorResult)) {
    return { kind: "vendor" as const, ...vendorResult };
  }

  return { error: "Admin or vendor access required", status: 401 as const };
}

// POST — create a new short-lived upload session tied to a vendor, and
// return the token the mobile page needs (the QR just encodes its URL).
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateEither(request);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    let vendorId: string | null;
    if (auth.kind === "vendor") {
      vendorId = auth.vendorProfile.id;
    } else {
      const body = await request.json().catch(() => ({}));
      if (body.vendorId) {
        const vendor = await prisma.vendorProfile.findUnique({ where: { id: body.vendorId } });
        if (!vendor) {
          return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 400 });
        }
        vendorId = vendor.id;
      } else {
        vendorId = null; // admin / house-owned product
      }
    }

    // Vendor's own warehouse — auto-attached to the session so the desktop
    // form doesn't have to ask for it again once the phone upload completes.
    const defaultWarehouse = vendorId ? await prisma.warehouse.findFirst({
          where: { vendorId, isActive: true },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        }) : null;

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000);

    const session = await prisma.productUploadSession.create({
      data: {
        token,
        vendorId : vendorId,
        warehouseId: defaultWarehouse?.id,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        token: session.token,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error("Create upload session error:", error);
    return NextResponse.json({ success: false, error: "Could not create upload session." }, { status: 500 });
  }
}

// GET — desktop polls this while the QR modal is open to find out whether
// the phone has finished uploading yet.
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateEither(request);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const token = new URL(request.url).searchParams.get("token");
    if (!token) {
      return NextResponse.json({ success: false, error: "token is required" }, { status: 400 });
    }

    const session = await prisma.productUploadSession.findUnique({
      where: { token },
      include: {
        mediaAssets: { include : { mediaAsset : { select: { id: true, publicUrl: true } } } },
        warehouse: { select: { id: true, name: true } },
        vendor: { select: { id: true, businessName: true, vendorCode: true } },
      },
    });

    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    if (session.status === "pending" && session.expiresAt < new Date()) {
      return NextResponse.json({ success: true, data: { status: "expired" } });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: session.status,
        mediaAssets: session.mediaAssets.map((a) => a.mediaAsset),
        warehouse: session.warehouse,
        vendor: session.vendor,
      },
    });
  } catch (error) {
    console.error("Poll upload session error:", error);
    return NextResponse.json({ success: false, error: "Could not check upload session." }, { status: 500 });
  }
}