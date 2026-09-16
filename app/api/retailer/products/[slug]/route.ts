import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRetailer } from "@/lib/auth/guard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const guard = await requireRetailer(request);
    if ("error" in guard) {
      return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
    }

    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: { select: { id: true, name: true, requiresSize: true } },
        vendor: { select: { id: true, businessName: true } },
        sizes: {
          where: { availableSets: { gt: 0 } },
          orderBy: { sortOrder: "asc" },
          select: { id: true, size: true, availableSets: true, sortOrder: true },
        },
        gstConfig: {
          select: {
            hsnCode: true,
            cgstRate: true,
            sgstRate: true,
            igstRate: true,
            billingEntityId: true,
          },
        },
        media: {
          orderBy: { sortOrder: "asc" },
          include: { mediaAsset: { select: { publicUrl: true } } },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const gstRate = product.gstConfig
      ? Number(product.gstConfig.cgstRate) + Number(product.gstConfig.sgstRate)
      : 5;

    const shaped = {
      id: product.id,
      slug: product.slug,
      sku: product.sku,
      designNumber: product.designNumber,
      name: product.name,
      description: product.description ?? "",
      categoryId: product.categoryId,
      categoryName: product.category?.name ?? "",
      categoryRequiresSize: product.category?.requiresSize ?? false,
      sellerName: product.vendor?.businessName ?? "IcchaStore",
      fabric: product.fabric,
      workType: product.workType,
      style: product.style,
      clothingType: product.clothingType,
      piecesPerSet: product.piecesPerSet,
      wholesalePricePerPiece: Number(product.wholesalePricePerPiece),
      wholesalePricePerSet: Number(product.wholesalePricePerSet),
      availableSets: product.availableSets,
      sizeCombination: product.sizeCombination,
      sizeStocks: product.sizes.map((row) => ({
        size: row.size,
        availableSets: row.availableSets,
      })),
      sizes: product.sizes.length > 0
        ? product.sizes.map((row) => row.size)
        : product.sizeCombination
        .split(",")
        .map((s) => s.trim().split(/[\s(]/)[0])
        .filter(Boolean),
      billingEntityId: product.gstConfig?.billingEntityId ?? null,
      hsn: product.gstConfig?.hsnCode ?? product.hsnCode,
      gstRate,
      media: product.media.map((m) => ({
        id: m.id,
        type: m.mediaType === "VIDEO" ? "video" : "image",
        url: m.mediaAsset.publicUrl,
        alt: product.name,
        isPrimary: m.isPrimary,
      })),
    };

    return NextResponse.json({ success: true, data: shaped });
  } catch (error) {
    console.error("Retailer product detail error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}