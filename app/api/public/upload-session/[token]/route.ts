import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStorageService } from "@/lib/services/storageService";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;

async function loadSession(token: string) {
  return prisma.productUploadSession.findUnique({
    where: { token },
    include: {
      vendor: { select: { businessName: true } },
      mediaAssets: { include: { mediaAsset: true } },
    },
  });
}

// GET — unchanged in spirit, but now also tells the client how many photos
// are already attached (useful if they reload the page mid-session).
export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await loadSession(token);

  if (!session) {
    return NextResponse.json({ success: false, error: "This upload link is invalid." }, { status: 404 });
  }
  if (session.status === "uploaded") {
    return NextResponse.json({
      success: true,
      data: { status: "uploaded", vendorName: session.vendor.businessName, photoCount: session.mediaAssets.length },
    });
  }
  if (session.expiresAt < new Date()) {
    return NextResponse.json({ success: true, data: { status: "expired", vendorName: session.vendor.businessName } });
  }

  return NextResponse.json({
    success: true,
    data: { status: "pending", vendorName: session.vendor.businessName, photoCount: session.mediaAssets.length },
  });
}

// POST — accepts one file per call, but no longer marks the session
// "uploaded" or rejects further calls. It just appends to the session's
// photo list. The session is only finalized by PATCH (see below).
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const session = await loadSession(token);

    if (!session) {
      return NextResponse.json({ success: false, error: "This upload link is invalid." }, { status: 404 });
    }
    if (session.status === "uploaded") {
      return NextResponse.json({ success: false, error: "This session has already been finished." }, { status: 409 });
    }
    if (session.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: "This upload link has expired. Please generate a new QR code." }, { status: 410 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "Please choose or capture a photo first." }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Please upload a JPG, PNG, WebP or HEIC photo." }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ success: false, error: "That photo is too large (max 15 MB)." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorageService();
    const result = await storage.uploadFile(buffer, file.name || "phone-upload.jpg", {
      contentType: file.type,
      folder: "products",
      isPrivate: false,
    });

    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        storageProvider: result.storageProvider,
        bucket: result.bucket,
        storageKey: result.storageKey,
        publicUrl: result.publicUrl,
        visibility: "PUBLIC",
        mimeType: file.type,
        originalFilename: file.name || "phone-upload.jpg",
        fileExtension: (file.name || "jpg").split(".").pop() || "jpg",
        sizeBytes: file.size,
        mediaType: "PRODUCT_IMAGE",
      },
    });

    await prisma.productUploadSessionAsset.create({
      data: { sessionId: session.id, mediaAssetId: mediaAsset.id },
    });

    return NextResponse.json({ success: true, data: { mediaAssetId: mediaAsset.id } });
  } catch (error) {
    console.error("Mobile upload error:", error);
    return NextResponse.json({ success: false, error: "Upload failed. Please try again." }, { status: 500 });
  }
}

// PATCH — the client calls this once the user taps "Done" on the phone.
// This is the ONLY place status flips to "uploaded", finalizing the session.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const session = await loadSession(token);

    if (!session) {
      return NextResponse.json({ success: false, error: "This upload link is invalid." }, { status: 404 });
    }
    if (session.status === "uploaded") {
      return NextResponse.json({ success: true, data: { status: "uploaded" } });
    }
    if (session.mediaAssets.length === 0) {
      return NextResponse.json({ success: false, error: "Upload at least one photo before finishing." }, { status: 400 });
    }

    await prisma.productUploadSession.update({
      where: { token },
      data: { status: "uploaded" },
    });

    return NextResponse.json({ success: true, data: { status: "uploaded", photoCount: session.mediaAssets.length } });
  } catch (error) {
    console.error("Mobile upload finish error:", error);
    return NextResponse.json({ success: false, error: "Could not finish this session. Please try again." }, { status: 500 });
  }
}