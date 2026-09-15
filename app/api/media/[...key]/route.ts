import { NextRequest, NextResponse } from 'next/server';
import { LocalStorageService } from '@/lib/services/storageService';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key } = await params;
    const storageKey = key.join('/');

    const fileData = await LocalStorageService.getFileBuffer(storageKey);

    if (!fileData) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Look up the real content type from the database record rather than guessing.
    const asset = await prisma.mediaAsset.findUnique({
      where: { storageKey },
      select: { mimeType: true },
    });

    return new NextResponse(new Uint8Array(fileData.buffer), {
      headers: {
        'Content-Type': asset?.mimeType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Media serve error:', error);
    return NextResponse.json(
      { error: 'Failed to stream media asset' },
      { status: 500 }
    );
  }
}