import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRetailer } from "@/lib/auth/guard";

const updateSchema = z.object({
  sets: z.number().int().min(1, "Must have at least 1 set — use DELETE to remove the item"),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const guard = await requireRetailer(request);
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
  }

  const { productId } = await params;

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { sets } = parsed.data;

  const cart = await prisma.cart.findUnique({
    where: { retailerProfileId: guard.retailerProfile.id },
  });

  if (!cart) {
    return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 404 });
  }

  const item = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
    include: { product: true },
  });

  if (!item) {
    return NextResponse.json({ success: false, error: "Item not found in your cart" }, { status: 404 });
  }

  if (sets > item.product.availableSets) {
    return NextResponse.json(
      { success: false, error: `Only ${item.product.availableSets} set(s) available` },
      { status: 409 }
    );
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { sets },
  });

  return NextResponse.json({ success: true, data: { productId, sets } });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const guard = await requireRetailer(request);
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
  }

  const { productId } = await params;

  const cart = await prisma.cart.findUnique({
    where: { retailerProfileId: guard.retailerProfile.id },
  });

  if (!cart) {
    return NextResponse.json({ success: false, error: "Cart is empty" }, { status: 404 });
  }

  const item = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (!item) {
    return NextResponse.json({ success: false, error: "Item not found in your cart" }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: item.id } });

  return NextResponse.json({ success: true, data: { productId, removed: true } });
}