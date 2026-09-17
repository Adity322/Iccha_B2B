import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/guard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const guard = await requireStaff(request);

  if ("error" in guard) {
    return NextResponse.json(
      { success: false, error: guard.error },
      { status: guard.status }
    );
  }

  const { orderId } = await params;
  const vendorId = request.nextUrl.searchParams.get("vendorId");

  try {
    const sellerOrders = await prisma.sellerOrder.findMany({
      where: {
        orderEnquiryId: orderId,
        ...(vendorId ? { vendorId } : {}),
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        vendorId: true,
        sellerName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            sku: true,
            designNumber: true,
            sets: true,
            totalPieces: true,
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

    return NextResponse.json({
      success: true,
      data: sellerOrders.map((sellerOrder) => ({
        ...sellerOrder,
        status: sellerOrder.status.toLowerCase(),
        createdAt: sellerOrder.createdAt.toISOString(),
        updatedAt: sellerOrder.updatedAt.toISOString(),
        history: sellerOrder.history.map((entry) => ({
          ...entry,
          status: entry.status.toLowerCase(),
          createdAt: entry.createdAt.toISOString(),
        })),
      })),
    });
  } catch (error) {
    console.error("Get seller orders for admin detail error:", error);

    return NextResponse.json(
      { success: false, error: "Could not load seller order statuses." },
      { status: 500 }
    );
  }
}
