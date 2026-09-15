import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStorageService } from "@/lib/services/storageService";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, matches the UI copy on Step 2

const LOCKED_STATUSES = ["APPROVED", "REJECTED", "SUSPENDED"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const applicationId = formData.get("applicationId") as string | null;
    const documentType = (formData.get("documentType") as string) || "business_proof";

    if (!file || !applicationId) {
      return NextResponse.json(
        { success: false, error: "File and applicationId are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type (${file.type}). Allowed: JPEG, PNG, WebP, PDF` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: `File exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)` },
        { status: 400 }
      );
    }

    const application = await prisma.kYCApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    if (LOCKED_STATUSES.includes(application.status)) {
      return NextResponse.json(
        { success: false, error: "This application has already been reviewed and can no longer accept documents" },
        { status: 409 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storage = getStorageService();
    const uploadResult = await storage.uploadFile(buffer, file.name, {
      contentType: file.type,
      folder: "kyc-documents",
      isPrivate: true,
    });

    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        storageProvider: uploadResult.storageProvider,
        bucket: uploadResult.bucket,
        storageKey: uploadResult.storageKey,
        publicUrl: uploadResult.publicUrl,
        visibility: "PRIVATE",
        mimeType: file.type,
        originalFilename: file.name,
        fileExtension: file.name.split(".").pop() || "",
        sizeBytes: file.size,
        mediaType: "KYC_DOCUMENT",
      },
    });

    const kycDocument = await prisma.kYCDocument.create({
      data: {
        applicationId: application.id,
        documentType,
        mediaAssetId: mediaAsset.id,
        originalFilename: file.name,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: kycDocument.id,
        name: kycDocument.originalFilename,
        type: kycDocument.documentType,
        size: `${(kycDocument.fileSize / (1024 * 1024)).toFixed(2)} MB`,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("KYC document upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload document" },
      { status: 500 }
    );
  }
}