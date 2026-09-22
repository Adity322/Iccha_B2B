import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/guard";
import { LocalStorageService } from "@/lib/services/storageService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  const guard = await requireStaff(request);
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
  }

  const { docId } = await params;

  const doc = await prisma.kYCDocument.findUnique({
    where: { id: docId },
    include: { mediaAsset: true },
  });

  if (!doc) {
    return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
  }

  const fileData = await LocalStorageService.getFileBuffer(doc.mediaAsset.storageKey);
  if (!fileData) {
    return NextResponse.json({ success: false, error: "File missing from storage" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(fileData.buffer), {
    headers: {
      "Content-Type": doc.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${doc.originalFilename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}