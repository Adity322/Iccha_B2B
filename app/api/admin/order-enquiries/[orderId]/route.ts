import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff, requireVendor } from "@/lib/auth/guard";

async function getAuth(request: NextRequest) {
  const staff = await requireStaff(request);
  if (!("error" in staff)) return { kind: "staff" as const, ...staff };

  const vendor = await requireVendor(request);
  if (!("error" in vendor)) return { kind: "vendor" as const, ...vendor };

  return { error: "Admin or vendor access required.", status: 401 as const };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const auth = await getAuth(request);
    if ("error" in auth) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }

    const { orderId } = await params;

    const order = await prisma.orderEnquiry.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      select: {
        id: true,
        orderNumber: true,
        retailerBusinessName: true,
        retailerApplicantName: true,
        retailerGstin: true,
        retailerContact: true,
        retailerEmail: true,
        billingAddressJson: true,
        shippingAddressJson: true,
        totalDesigns: true,
        totalSets: true,
        totalPieces: true,
        subtotal: true,
        totalGst: true,
        shipping: true,
        masterTotal: true,
        status: true,
        customerRemarks: true,
        createdAt: true,
        updatedAt: true,
        items: {
          orderBy: { id: "asc" },
          select: {
            id: true,
            productId: true,
            billingEntityId: true,
            productName: true,
            sku: true,
            designNumber: true,
            categoryName: true,
            sets: true,
            piecesPerSet: true,
            totalPieces: true,
            pieceRate: true,
            setRate: true,
            lineSubtotal: true,
            hsn: true,
            gstRate: true,
            gstAmount: true,
            totalWithGst: true,
            imageUrl: true,
            color: true,
            sizeCombination: true,
            product: {
              select: {
                id: true,
                vendorId: true,
                vendor: { select: { id: true, businessName: true } },
                warehouse: {
                  select: { id: true, name: true, city: true, state: true },
                },
              },
            },
          },
        },
        history: {
          orderBy: { createdAt: "asc" },
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

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404 });
    }

    const visibleItems =
      auth.kind === "vendor"
        ? order.items.filter(i => i.product.vendorId === auth.vendorProfile.id)
        : order.items;

    if (auth.kind === "vendor" && visibleItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "You are not allowed to view this order." },
        { status: 403 }
      );
    }

    const items = visibleItems.map(item => ({
      ...item,
      pieceRate: Number(item.pieceRate),
      setRate: Number(item.setRate),
      lineSubtotal: Number(item.lineSubtotal),
      gstRate: Number(item.gstRate),
      gstAmount: Number(item.gstAmount),
      totalWithGst: Number(item.totalWithGst),
    }));

    const subtotal = items.reduce((s, i) => s + i.lineSubtotal, 0);
    const gst = items.reduce((s, i) => s + i.gstAmount, 0);
    const total = items.reduce((s, i) => s + i.totalWithGst, 0);
    const sets = items.reduce((s, i) => s + i.sets, 0);
    const pieces = items.reduce((s, i) => s + i.totalPieces, 0);
    const designs = new Set(items.map(i => i.designNumber)).size;

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        totalDesigns: auth.kind === "staff" ? order.totalDesigns : designs,
        totalSets: auth.kind === "staff" ? order.totalSets : sets,
        totalPieces: auth.kind === "staff" ? order.totalPieces : pieces,
        subtotal: auth.kind === "staff" ? Number(order.subtotal) : subtotal,
        totalGst: auth.kind === "staff" ? Number(order.totalGst) : gst,
        shipping: auth.kind === "staff" ? Number(order.shipping) : 0,
        masterTotal: auth.kind === "staff" ? Number(order.masterTotal) : total,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        items,
        history: order.history.map(h => ({ ...h, createdAt: h.createdAt.toISOString() })),
        scope: auth.kind === "vendor" ? "vendor" : "admin",
      },
    });
  } catch (error) {
    console.error("Get order enquiry detail error:", error);
    return NextResponse.json(
      { success: false, error: "Could not load this order." },
      { status: 500 }
    );
  }
}
