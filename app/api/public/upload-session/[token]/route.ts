import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStorageService } from "@/lib/services/storageService";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024;

async function loadSession(token: string) {
  return prisma.productUploadSession.findUnique({
    where: { token },
    include: { vendor: { select: { businessName: true } } },
  });
}

// GET — lets the mobile page greet the vendor by name and know whether this
// link has already been used or has expired, before showing the camera UI.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await loadSession(token);

  if (!session) {
    return NextResponse.json({ success: false, error: "This upload link is invalid." }, { status: 404 });
  }
  if (session.status === "uploaded") {
    return NextResponse.json({ success: true, data: { status: "uploaded", vendorName: session.vendor.businessName } });
  }
  if (session.expiresAt < new Date()) {
    return NextResponse.json({ success: true, data: { status: "expired", vendorName: session.vendor.businessName } });
  }

  return NextResponse.json({ success: true, data: { status: "pending", vendorName: session.vendor.businessName } });
}

// POST — the phone submits the photo here. Public/unauthenticated on purpose:
// the unguessable token *is* the credential, and it's single-use + short-lived.
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const session = await loadSession(token);

    if (!session) {
      return NextResponse.json({ success: false, error: "This upload link is invalid." }, { status: 404 });
    }
    if (session.status === "uploaded") {
      return NextResponse.json({ success: false, error: "A photo has already been uploaded for this link." }, { status: 409 });
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

    await prisma.productUploadSession.update({
      where: { token },
      data: { status: "uploaded", mediaAssetId: mediaAsset.id },
    });

    return NextResponse.json({ success: true, data: { mediaAssetId: mediaAsset.id } });
  } catch (error) {
    console.error("Mobile upload error:", error);
    return NextResponse.json({ success: false, error: "Upload failed. Please try again." }, { status: 500 });
  }
}