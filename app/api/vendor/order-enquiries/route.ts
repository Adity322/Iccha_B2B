import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireVendor } from "@/lib/auth/guard";

export async function GET(request: NextRequest) {
  const guard = await requireVendor(request);

  if ("error" in guard) {
    return NextResponse.json(
      { success: false, error: guard.error },
      { status: guard.status }
    );
  }

  try {
    const orderId = request.nextUrl.searchParams.get("orderId");

    const sellerOrders = await prisma.sellerOrder.findMany({
      where: {
        vendorId: guard.vendorProfile.id,
        ...(orderId ? { orderEnquiryId: orderId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        orderEnquiry: {
          select: {
            id: true,
            orderNumber: true,
            retailerBusinessName: true,
            retailerApplicantName: true,
            retailerContact: true,
            retailerEmail: true,
            shippingAddressJson: true,
            createdAt: true,
          },
        },
        items: {
          orderBy: { id: "asc" },
          select: {
            id: true,
            productId: true,
            productName: true,
            sku: true,
            designNumber: true,
            categoryName: true,
            sets: true,
            piecesPerSet: true,
            totalPieces: true,
            setRate: true,
            lineSubtotal: true,
            gstAmount: true,
            totalWithGst: true,
            imageUrl: true,
            color: true,
            sizeCombination: true,
          },
        },
        history: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            actorName: true,
            notes: true,
            createdAt: true,
          },
        },
      },
    });

    const data = sellerOrders.map((sellerOrder) => ({
      ...sellerOrder,
      createdAt: sellerOrder.createdAt.toISOString(),
      updatedAt: sellerOrder.updatedAt.toISOString(),
      orderEnquiry: {
        ...sellerOrder.orderEnquiry,
        createdAt: sellerOrder.orderEnquiry.createdAt.toISOString(),
      },
      items: sellerOrder.items.map((item) => ({
        ...item,
        setRate: Number(item.setRate),
        lineSubtotal: Number(item.lineSubtotal),
        gstAmount: Number(item.gstAmount),
        totalWithGst: Number(item.totalWithGst),
      })),
      history: sellerOrder.history.map((entry) => ({
        ...entry,
        status: entry.status.toLowerCase(),
        createdAt: entry.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Get vendor seller orders error:", error);

    return NextResponse.json(
      { success: false, error: "Could not load your order enquiries." },
      { status: 500 }
    );
  }
}
