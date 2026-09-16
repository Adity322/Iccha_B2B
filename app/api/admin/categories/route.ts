import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff, requireVendor, requireRetailer } from "@/lib/auth/guard";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const staffResult = await requireStaff(request);
    if ("error" in staffResult) {
      const vendorResult = await requireVendor(request);
      if ("error" in vendorResult) {
        const retailerResult = await requireRetailer(request);
        if ("error" in retailerResult) {
          return NextResponse.json(
            { success: false, error: "Login required" },
            { status: 401 }
          );
        }
      }
    }

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        requiresSize: true,
        mediaAsset: { select: { publicUrl: true } },
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Categories list error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  type: z.string().default("kurti_pant_set"),
  mediaAssetId: z.string().optional(),
  requiresSize: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const guard = await requireStaff(request);
    if ("error" in guard) {
      return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
    }

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({ data: parsed.data });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}