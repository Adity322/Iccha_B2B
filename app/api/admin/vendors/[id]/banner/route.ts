import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireStaff } from '@/lib/auth/guard';
import { validateBannerFile, saveVendorBanner, removeVendorBanner, } from '@/lib/services/vendorBannerService';

const vendorSelect = { id: true, businessName: true, bannerAssetId: true } as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireStaff(request);
    if ('error' in guard) {
      return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
    }

    const { id } = await params;
    const vendor = await prisma.vendorProfile.findUnique({ where: { id }, select: vendorSelect });
    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const checked = validateBannerFile(formData.get('file'));
    if ('error' in checked) {
      return NextResponse.json({ success: false, error: checked.error }, { status: 400 });
    }

    const bannerUrl = await saveVendorBanner(vendor, checked.file, guard.user.id);
    return NextResponse.json({ success: true, data: { bannerUrl } }, { status: 201 });
  } catch (error) {
    console.error('Admin vendor banner upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireStaff(request);
    if ('error' in guard) {
      return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
    }

    const { id } = await params;
    const vendor = await prisma.vendorProfile.findUnique({ where: { id }, select: vendorSelect });
    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    await removeVendorBanner(vendor);
    return NextResponse.json({ success: true, data: { bannerUrl: null } });
  } catch (error) {
    console.error('Admin vendor banner remove error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}