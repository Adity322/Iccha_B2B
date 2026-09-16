import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRetailer } from "@/lib/auth/guard";

function toNumber(value: unknown): number {
  return Number(value ?? 0);
}

function parseJson(value: string | null | undefined) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalizeStatus(status: string) {
  return status.toLowerCase();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const guard = await requireRetailer(request);

  if ("error" in guard) {
    return NextResponse.json(
      { success: false, error: guard.error },
      { status: guard.status }
    );
  }

  try {
    const { orderId } = await params;
    const retailerProfileId = guard.retailerProfile.id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required." },
        { status: 400 }
      );
    }

    // Important: scope the lookup to the authenticated retailer.
    // The URL alone must never be enough to access another retailer's order.
    const order = await prisma.orderEnquiry.findFirst({
      where: {
        id: orderId,
        retailerProfileId,
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
        internalNotes: true,
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
          },
        },

        estimates: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            estimateNumber: true,
            orderEnquiryId: true,
            billingEntityId: true,
            date: true,
            validUntil: true,
            totalSets: true,
            totalPieces: true,
            taxableSubtotal: true,
            isInterState: true,
            cgstAmount: true,
            sgstAmount: true,
            igstAmount: true,
            totalGst: true,
            shippingCharge: true,
            grandTotal: true,
            pdfMediaAssetId: true,
            billingEntity: {
              select: {
                id: true,
                code: true,
                legalName: true,
                tradeName: true,
                gstin: true,
                pan: true,
                state: true,
                stateCode: true,
                registeredAddress: true,
                contactEmail: true,
                contactPhone: true,
                bankName: true,
                accountHolder: true,
                accountNumber: true,
                ifsc: true,
                branch: true,
                upiId: true,
                estimatePrefix: true,
                invoicePrefix: true,
                defaultGstRate: true,
                isActive: true,
              },
            },
          },
        },

        history: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            status: true,
            actorUserId: true,
            actorName: true,
            notes: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 }
      );
    }

    const data = {
      id: order.id,
      orderNumber: order.orderNumber,
      retailerBusinessName: order.retailerBusinessName,
      retailerApplicantName: order.retailerApplicantName,
      retailerGstin: order.retailerGstin,
      retailerContact: order.retailerContact,
      retailerEmail: order.retailerEmail,

      billingAddress: parseJson(order.billingAddressJson),
      shippingAddress: parseJson(order.shippingAddressJson),

      totalDesigns: order.totalDesigns,
      totalSets: order.totalSets,
      totalPieces: order.totalPieces,
      subtotal: toNumber(order.subtotal),
      totalGst: toNumber(order.totalGst),
      shipping: toNumber(order.shipping),
      masterTotal: toNumber(order.masterTotal),

      status: normalizeStatus(order.status),
      customerRemarks: order.customerRemarks,
      internalNotes: order.internalNotes,

      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),

      items: order.items.map((item) => ({
        ...item,
        pieceRate: toNumber(item.pieceRate),
        setRate: toNumber(item.setRate),
        lineSubtotal: toNumber(item.lineSubtotal),
        gstRate: toNumber(item.gstRate),
        gstAmount: toNumber(item.gstAmount),
        totalWithGst: toNumber(item.totalWithGst),
      })),

      estimates: order.estimates.map((estimate) => ({
        id: estimate.id,
        estimateNumber: estimate.estimateNumber,
        orderId: estimate.orderEnquiryId,
        orderNumber: order.orderNumber,
        date: estimate.date.toISOString(),
        validUntil: estimate.validUntil.toISOString(),
        totalSets: estimate.totalSets,
        totalPieces: estimate.totalPieces,
        taxableSubtotal: toNumber(estimate.taxableSubtotal),
        isInterState: estimate.isInterState,
        cgstAmount: toNumber(estimate.cgstAmount),
        sgstAmount: toNumber(estimate.sgstAmount),
        igstAmount: toNumber(estimate.igstAmount),
        totalGst: toNumber(estimate.totalGst),
        shippingCharge: toNumber(estimate.shippingCharge),
        grandTotal: toNumber(estimate.grandTotal),
        pdfMediaAssetId: estimate.pdfMediaAssetId,
        billingEntity: estimate.billingEntity,
        paymentTerms: [],
        items: [],
      })),

      timeline: order.history.map((entry) => ({
        id: entry.id,
        status: normalizeStatus(entry.status),
        actorUserId: entry.actorUserId,
        actorName: entry.actorName,
        notes: entry.notes,
        timestamp: entry.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get retailer order detail error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Could not load this order.",
      },
      { status: 500 }
    );
  }
}
