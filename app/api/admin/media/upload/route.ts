import { NextRequest, NextResponse } from 'next/server';
import { getStorageService } from '@/lib/services/storageService';
import { prisma } from '@/lib/db';
import { requireStaffOrVendor } from '@/lib/auth/guard';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'application/pdf',
  'video/mp4',
];

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export async function POST(req: NextRequest) {
  const auth = await requireStaffOrVendor(req);
  if ('error' in auth) {
    return NextResponse.json(
      { success: false, data: null, error: { code: 'UNAUTHORIZED', message: auth.error } },
      { status: auth.status }
    );
  }
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const mediaType = (formData.get('mediaType') as string) || 'HERO_DESKTOP';
    const isPrivate = formData.get('isPrivate') === 'true';

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'NO_FILE_PROVIDED', message: 'Please provide a media file to upload' },
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'INVALID_MIME_TYPE',
            message: `Unsupported file format (${file.type}). Allowed: JPEG, PNG, WebP, AVIF, PDF, MP4`,
          },
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File size exceeds limit (${(file.size / (1024 * 1024)).toFixed(2)} MB > 15 MB)`,
          },
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storage = getStorageService();
    const folder = mediaType.startsWith('HERO')
      ? 'hero-campaigns'
      : mediaType.startsWith('KYC')
      ? 'kyc-documents'
      : 'products';

    const result = await storage.uploadFile(buffer, file.name, {
      contentType: file.type,
      folder,
      isPrivate,
    });

    // Persist the real MediaAsset row — anything downstream (ProductMedia, KYCDocument, etc.)
    // needs a real database id here, not a fabricated string, or the foreign key will reject it.
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        storageProvider: result.storageProvider,
        bucket: result.bucket,
        storageKey: result.storageKey,
        publicUrl: result.publicUrl,
        visibility: isPrivate ? 'PRIVATE' : 'PUBLIC',
        mimeType: file.type,
        originalFilename: file.name,
        fileExtension: file.name.split('.').pop() || '',
        sizeBytes: file.size,
        mediaType,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: mediaAsset,
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'MEDIA_UPLOAD_FAILED', message: 'Failed to upload and store media asset' },
      },
      { status: 500 }
    );
  }
}