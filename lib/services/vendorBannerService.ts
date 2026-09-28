import { prisma } from '@/lib/db';
import { getStorageService } from '@/lib/services/storageService';

export const BANNER_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const BANNER_MAX_BYTES = 8 * 1024 * 1024; // 8 MB

type BannerTarget = { id: string; businessName: string; bannerAssetId: string | null };

export function validateBannerFile(
  entry: FormDataEntryValue | null
): { file: File } | { error: string } {
  if (!entry || typeof entry === 'string') return { error: 'Please choose an image to upload.' };
  if (!BANNER_ALLOWED_TYPES.includes(entry.type)) return { error: 'Banner must be a JPG, PNG or WebP image.' };
  if (entry.size > BANNER_MAX_BYTES) return { error: 'Banner must be 8 MB or smaller.' };
  return { file: entry };
}

// Best-effort cleanup. Only ever touches VENDOR_BANNER assets, so it can never
// delete a product photo or KYC document by accident.
async function discardBannerAsset(assetId: string) {
  try {
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: assetId },
      select: { id: true, storageKey: true, bucket: true, mediaType: true },
    });
    if (!asset || asset.mediaType !== 'VENDOR_BANNER') return;
    await prisma.mediaAsset.delete({ where: { id: asset.id } });
    await getStorageService().deleteFile(asset.storageKey, asset.bucket);
  } catch (error) {
    console.error('Vendor banner cleanup error:', error);
  }
}

/** Uploads the file, links it to the vendor, removes the old banner. Returns the new public URL. */
export async function saveVendorBanner(
  vendor: BannerTarget,
  file: File,
  uploadedByUserId: string
): Promise<string | null> {
  const storage = getStorageService();
  const buffer = Buffer.from(await file.arrayBuffer());
  const stored = await storage.uploadFile(buffer, file.name, {
    contentType: file.type,
    folder: 'vendor-banners',
  });

  // Nested create = asset row and vendor link are written atomically.
  const updated = await prisma.vendorProfile.update({
    where: { id: vendor.id },
    data: {
      bannerAsset: {
        create: {
          storageProvider: stored.storageProvider,
          bucket: stored.bucket,
          storageKey: stored.storageKey,
          publicUrl: stored.publicUrl,
          visibility: 'PUBLIC',
          mimeType: file.type,
          originalFilename: file.name,
          fileExtension: file.name.split('.').pop() || '',
          sizeBytes: file.size,
          mediaType: 'VENDOR_BANNER',
          altText: `${vendor.businessName} banner`,
          createdById: uploadedByUserId,
        },
      },
    },
    select: { bannerAsset: { select: { publicUrl: true } } },
  });

  if (vendor.bannerAssetId) await discardBannerAsset(vendor.bannerAssetId);
  return updated.bannerAsset?.publicUrl ?? null;
}

export async function removeVendorBanner(vendor: Pick<BannerTarget, 'id' | 'bannerAssetId'>) {
  if (!vendor.bannerAssetId) return;
  await prisma.vendorProfile.update({
    where: { id: vendor.id },
    data: { bannerAssetId: null },
  });
  await discardBannerAsset(vendor.bannerAssetId);
}