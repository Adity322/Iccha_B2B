import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireStaff, requireVendor } from "@/lib/auth/guard";

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  mediaAssetId: z.string().optional(),
  requiresSize: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const staffResult = await requireStaff(request);

    if ("error" in staffResult) {
      const vendorResult = await requireVendor(request);

      if ("error" in vendorResult) {
        return NextResponse.json(
          { success: false, error: "Staff or vendor access required" },
          { status: 403 }
        );
      }

      const existing = await prisma.category.findUnique({
        where: { id },
        select: { vendorId: true },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 404 }
        );
      }

      if (existing.vendorId !== vendorResult.vendorProfile.id) {
        return NextResponse.json(
          { success: false, error: "You can only edit your own categories" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const staffResult = await requireStaff(request);

    if ("error" in staffResult) {
      const vendorResult = await requireVendor(request);

      if ("error" in vendorResult) {
        return NextResponse.json(
          { success: false, error: "Staff or vendor access required" },
          { status: 403 }
        );
      }

      const existing = await prisma.category.findUnique({
        where: { id },
        select: { vendorId: true },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 404 }
        );
      }

      if (existing.vendorId !== vendorResult.vendorProfile.id) {
        return NextResponse.json(
          { success: false, error: "You can only delete your own categories" },
          { status: 403 }
        );
      }
    }

    const force = new URL(request.url).searchParams.get("force") === "true";

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    // First hit without ?force=true: report the count so the client can
    // show a confirmation popup instead of failing outright.
    if (productCount > 0 && !force) {
      return NextResponse.json(
        {
          success: false,
          requiresConfirmation: true,
          productCount,
          error: `This category has ${productCount} product${productCount === 1 ? "" : "s"}. Deleting it will permanently delete ${productCount === 1 ? "that product" : "all of them"} too.`,
        },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}