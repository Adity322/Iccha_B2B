import { prisma } from "@/lib/db";
import { Category, Product } from "@/lib/types";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const categoryInclude = {
    subcategories: { select: { name: true } },
    mediaAsset: { select: { publicUrl: true } },
    _count: { select: { products: true } },
  } satisfies Prisma.CategoryInclude;
  
  const productInclude = {
    category: { select: { name: true } },
    subcategory: { select: { name: true } },
    collection: { select: { name: true } },
    media: {
      include: { mediaAsset: { select: { publicUrl: true } } },
      orderBy: { sortOrder: 'asc' },
    },
  } satisfies Prisma.ProductInclude;
  

  
function mapCategoryType(type: string): Category['type'] {
  if (type === '3_pc_suit') return '3_piece';
  if (type === 'kurti_only') return 'kurti_only';
  if (type === 'kurti_pant_set') return '2_piece';
  return 'mixed';
}
type DbCategory = Prisma.CategoryGetPayload<{ include: typeof categoryInclude }>;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80';

  function toCategory(c: DbCategory): Category {
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || `Wholesale ${c.name} manufactured in-house.`,
      image: c.mediaAsset?.publicUrl || FALLBACK_IMAGE,
      billingEntityId: c.billingEntityId || undefined,
      subcategories: c.subcategories.map((s) => s.name),
      itemCount: c._count.products,
      representativeTagline: c.name,
      featured: c.isFeatured,
      type: mapCategoryType(c.type),
      popularFabrics: [],
    };
  }
  

  type DbProduct = Prisma.ProductGetPayload<{ include: typeof productInclude }>;
  
  function toProduct(p: DbProduct): Product {
    const availableSets = p.availableSets;
    const status: Product['status'] =
      availableSets === 0 ? 'out_of_stock' : availableSets <= 5 ? 'low_stock' : 'available';
  
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      designNumber: p.designNumber,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      subcategory: p.subcategory?.name || '',
      description: p.description || '',
      minOrderSets: p.minOrderSets ?? 1,
      fabric: p.fabric,
      workType: p.workType,
      style: p.style,
      clothingType: p.clothingType as Product['clothingType'],
      piecesPerSet: p.piecesPerSet,
      wholesalePricePerPiece: Number(p.wholesalePricePerPiece),
      wholesalePricePerSet: Number(p.wholesalePricePerSet),
      availableSets: p.availableSets,
      totalAvailablePieces: p.totalAvailablePieces,
      sizeCombination: p.sizeCombination,
      sizes: [],
      colors: [p.color],
      collectionName: p.collection?.name || 'General Wholesale',
      billingEntityId: undefined,
      hsn: p.hsnCode,
      gstRate: 5,
      status,
      isNewArrival: p.isNewArrival,
      isFeatured: p.isFeatured,
      media: p.media.map((m) => ({
        id: m.id,
        type: m.mediaType === 'VIDEO' ? 'video' : 'image',
        url: m.mediaAsset.publicUrl,
        alt: p.name,
        isPrimary: m.isPrimary,
      })),
      createdAt: p.createdAt.toISOString(),
    };
  }

  const vendorSelect = {
    id: true,
    businessName: true,
    city: true,
    state: true,
    bannerAsset: { select: { publicUrl: true } },
    _count: { select: { products: { where: { isActive: true } } } },
    products: {
      where: { isActive: true, media: { some: {} } },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: {
        media: {
          take: 1,
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          select: { mediaAsset: { select: { publicUrl: true } } },
        },
      },
    },
  } satisfies Prisma.VendorProfileSelect;

  type DbVendor = Prisma.VendorProfileGetPayload<{ select: typeof vendorSelect }>;

  function toVendor(v: DbVendor) {
    const images = v.products
      .map((p) => p.media[0]?.mediaAsset.publicUrl)
      .filter((url): url is string => Boolean(url));

    return {
      id: v.id,
      name: v.businessName,
      location: [v.city, v.state].filter(Boolean).join(', '),
      productCount: v._count.products,
      images,
      // uploaded banner -> latest product photo -> placeholder
      image: v.bannerAsset?.publicUrl ?? images[0] ?? FALLBACK_IMAGE,
    };
  }

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const getCatSlug = params.get("catSlug");


  if (getCatSlug) {
    const data = await prisma.category.findMany({
      include: {
        products: true,
      },
    });
    return NextResponse.json(
      {
        data,
      },
      { status: 200 },
    );
  }
  const [products, categories, vendors] = await prisma.$transaction([
    prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: productInclude
    }),
    prisma.category.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: categoryInclude
    }),
    prisma.vendorProfile.findMany({
      where: { isActive: true, user: { role: 'VENDOR' } },
      take: 8,
      orderBy: { businessName: 'asc' },
      select: vendorSelect,
    }),
  ]);
  
  const finalCat = categories.map(toCategory);
  const finalPdr = products.map(toProduct)
  
  return NextResponse.json(
    {
      products: finalPdr,
      categories: finalCat,
      vendors: vendors.map(toVendor)
    },
    { status: 200 },
  );
}
