import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRetailer } from "@/lib/auth/guard";

async function getOrCreateCart(retailerProfileId: string) {
  let cart = await prisma.cart.findUnique({
    where: { retailerProfileId },
    include: {
      items: {
        include: {
          product: {
            include: {
              media: {
                where: { isPrimary: true },
                take: 1,
                include: { mediaAsset: { select: { publicUrl: true } } },
              },
              vendor: { select: { businessName: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { retailerProfileId },
      include: {
        items: {
          include: {
            product: {
              include: {
                media: {
                where: { isPrimary: true },
                take: 1,
                include: { mediaAsset: { select: { publicUrl: true } } },
              },
                vendor: { select: { businessName: true } },
              },
            },
          },
        },
      },
    });
  }

  return cart;
}

function serializeCart(cart: Awaited<ReturnType<typeof getOrCreateCart>>) {
  return {
    id: cart.id,
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      sets: item.sets,
      product: {
        name: item.product.name,
        sku: item.product.sku,
        designNumber: item.product.designNumber,
        color: item.product.color,
        sizeCombination: item.product.sizeCombination,
        piecesPerSet: item.product.piecesPerSet,
        wholesalePricePerSet: item.product.wholesalePricePerSet.toString(),
        availableSets: item.product.availableSets,
        isActive: item.product.isActive,
        imageUrl: item.product.media[0]?.mediaAsset?.publicUrl || null,
        vendorName: item.product.vendor?.businessName || "IcchaStore",
      },
      lineSubtotal: (
        Number(item.product.wholesalePricePerSet) * item.sets
      ).toFixed(2),
    })),
    totalSets: cart.items.reduce((sum, i) => sum + i.sets, 0),
    totalDesigns: cart.items.length,
    subtotal: cart.items
      .reduce((sum, i) => sum + Number(i.product.wholesalePricePerSet) * i.sets, 0)
      .toFixed(2),
  };
}

export async function GET(request: NextRequest) {
  const guard = await requireRetailer(request);
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
  }

  const cart = await getOrCreateCart(guard.retailerProfile.id);
  return NextResponse.json({ success: true, data: serializeCart(cart) });
}

const addItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  sets: z.number().int().min(1, "Must add at least 1 set"),
});

export async function POST(request: NextRequest) {
  const guard = await requireRetailer(request);
  if ("error" in guard) {
    return NextResponse.json({ success: false, error: guard.error }, { status: guard.status });
  }

  const body = await request.json();
  const parsed = addItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { productId, sets } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return NextResponse.json({ success: false, error: "Product not found or unavailable" }, { status: 404 });
  }

  if (sets > product.availableSets) {
    return NextResponse.json(
      { success: false, error: `Only ${product.availableSets} set(s) available` },
      { status: 409 }
    );
  }

  const cart = await getOrCreateCart(guard.retailerProfile.id);

  const existingItem = cart.items.find((i) => i.productId === productId);

  if (existingItem) {
    const newSets = existingItem.sets + sets;
    if (newSets > product.availableSets) {
      return NextResponse.json(
        { success: false, error: `Only ${product.availableSets} set(s) available (you already have ${existingItem.sets} in cart)` },
        { status: 409 }
      );
    }
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { sets: newSets },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, sets },
    });
  }

  const updatedCart = await getOrCreateCart(guard.retailerProfile.id);
  return NextResponse.json({ success: true, data: serializeCart(updatedCart) }, { status: 201 });
}