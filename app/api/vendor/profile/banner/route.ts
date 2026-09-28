import { NextRequest, NextResponse } from 'next/server';
import { requireVendor } from '@/lib/auth/guard';
import { validateBannerFile, saveVendorBanner, removeVendorBanner, } from '@/lib/services/vendorBannerService';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireVendor(request);
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const formData = await request.formData();
    const checked = validateBannerFile(formData.get('file'));
    if ('error' in checked) {
      return NextResponse.json({ success: false, error: checked.error }, { status: 400 });
    }

    const bannerUrl = await saveVendorBanner(auth.vendorProfile, checked.file, auth.user.id);
    return NextResponse.json({ success: true, data: { bannerUrl } }, { status: 201 });
  } catch (error) {
    console.error('Vendor banner upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireVendor(request);
    if ('error' in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    await removeVendorBanner(auth.vendorProfile);
    return NextResponse.json({ success: true, data: { bannerUrl: null } });
  } catch (error) {
    console.error('Vendor banner remove error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}