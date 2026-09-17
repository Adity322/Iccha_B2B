import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRetailer } from "@/lib/auth/guard";

const FREE_SHIPPING_THRESHOLD = 20000;
const FLAT_SHIPPING = 350;
const NO_SIZE = "__NO_SIZE__";

const addressSchema = z.object({
  street: z.string().trim().min(1, "Delivery address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  stateCode: z.string().trim().min(1, "State code is required"),
  pincode: z.string().trim().min(4, "Valid pincode is required"),
  area: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
});

const submitSchema = z.object({
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
  transportAgency: z.string().trim().min(1, "Transporter agency is required"),
  preferredStation: z.string().trim().optional(),
  remarks: z.string().trim().optional(),
});

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function makeOrderNumber() {
  const stamp = Date.now().toString().slice(-8);
  const random = Math.floor(100 + Math.random() * 900);
  return `IC-ORD-${stamp}${random}`;
}


export async function GET(request: NextRequest) {
  const guard = await requireRetailer(request);

  if ("error" in guard) {
    return NextResponse.json(
      { success: false, error: guard.error },
      { status: guard.status }
    );
  }

  try {
    const retailerProfileId = guard.retailerProfile.id;

    const orders = await prisma.orderEnquiry.findMany({
      where: { retailerProfileId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        retailerBusinessName: true,
        retailerApplicantName: true,
        retailerGstin: true,
        retailerContact: true,
        retailerEmail: true,
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
            productName: true,
            sku: true,
            designNumber: true,
            categoryName: true,
            billingEntityId: true,
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
                estimatePrefix: true,
                defaultGstRate: true,
              },
            },
          },
        },
      },
    });

    const data = orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      totalGst: Number(order.totalGst),
      shipping: Number(order.shipping),
      masterTotal: Number(order.masterTotal),
      status: order.status.toLowerCase(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item) => ({
        ...item,
        pieceRate: Number(item.pieceRate),
        setRate: Number(item.setRate),
        lineSubtotal: Number(item.lineSubtotal),
        gstRate: Number(item.gstRate),
        gstAmount: Number(item.gstAmount),
        totalWithGst: Number(item.totalWithGst),
      })),
      estimates: order.estimates.map((estimate) => ({
        ...estimate,
        orderId: estimate.orderEnquiryId,
        orderNumber: order.orderNumber,
        date: estimate.date.toISOString(),
        validUntil: estimate.validUntil.toISOString(),
        taxableSubtotal: Number(estimate.taxableSubtotal),
        cgstAmount: Number(estimate.cgstAmount),
        sgstAmount: Number(estimate.sgstAmount),
        igstAmount: Number(estimate.igstAmount),
        totalGst: Number(estimate.totalGst),
        shippingCharge: Number(estimate.shippingCharge),
        grandTotal: Number(estimate.grandTotal),
        paymentTerms: [],
      })),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Get retailer order enquiries error:", error);

    return NextResponse.json(
      { success: false, error: "Could not load your order enquiries." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireRetailer(request);

  if ("error" in guard) {
    return NextResponse.json(
      { success: false, error: guard.error },
      { status: guard.status }
    );
  }

  try {
    const body = await request.json();
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid checkout details" },
        { status: 400 }
      );
    }

    const { billingAddress, shippingAddress, transportAgency, preferredStation, remarks } = parsed.data;
    const retailerProfileId = guard.retailerProfile.id;

    const result = await prisma.$transaction(
      async (tx) => {
      const retailer = await tx.retailerProfile.findUnique({
        where: { id: retailerProfileId },
        include: {
          user: { select: { email: true } },
        },
      });

      if (!retailer) {
        throw new Error("Retailer profile not found");
      }

      const cart = await tx.cart.findUnique({
        where: { retailerProfileId },
        include: {
          items: {
            orderBy: { createdAt: "asc" },
            include: {
              product: {
                include: {
                  category: { select: { id: true, name: true, requiresSize: true } },
                  vendor: { select: { id: true, businessName: true } },
                  gstConfig: {
                    include: { billingEntity: true },
                  },
                  media: {
                    where: { isPrimary: true },
                    take: 1,
                    include: { mediaAsset: { select: { publicUrl: true } } },
                  },
                  sizes: true,
                },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("Your cart is empty");
      }

      const totalDesigns = new Set(cart.items.map((item) => item.productId)).size;
      const totalSets = cart.items.reduce((sum, item) => sum + item.sets, 0);
      const totalPieces = cart.items.reduce(
        (sum, item) => sum + item.sets * item.product.piecesPerSet,
        0
      );
      const subtotal = cart.items.reduce(
        (sum, item) => sum + Number(item.product.wholesalePricePerSet) * item.sets,
        0
      );

      // Enforce the same base MOQ used by the live cart unless an approved
      // retailer override is active.
      if (!retailer.moqSetsOverride) {
        const rule = await tx.mOQRule.findFirst({
          where: { scope: "GLOBAL", isActive: true },
          orderBy: { createdAt: "desc" },
        });

        const requiredSets = rule?.minSets ?? 4;
        const requiredPieces = rule?.minPieces ?? 4;
        const requiredDesigns = rule?.minDesigns ?? 1;
        const requiredOrderValue = rule?.minOrderValue ? Number(rule.minOrderValue) : 0;

        if (
          totalSets < requiredSets ||
          totalPieces < requiredPieces ||
          totalDesigns < requiredDesigns ||
          subtotal < requiredOrderValue
        ) {
          throw new Error(
            `Minimum wholesale order not met. Required: ${requiredSets} sets, ${requiredPieces} pieces, ${requiredDesigns} design(s)`
          );
        }
      }

      const entityGroups = new Map<
        string,
        {
          entity: NonNullable<typeof cart.items[number]["product"]["gstConfig"]>["billingEntity"];
          subtotal: number;
          totalSets: number;
          totalPieces: number;
          gst: number;
          items: typeof cart.items;
        }
      >();

      for (const item of cart.items) {
        const product = item.product;

        if (!product.isActive) {
          throw new Error(`${product.name} is no longer available`);
        }

        if (!product.gstConfig?.billingEntity) {
          throw new Error(`${product.name} is missing its billing entity configuration`);
        }

        const entity = product.gstConfig.billingEntity;
        const lineSubtotal = Number(product.wholesalePricePerSet) * item.sets;
        const isInterState = shippingAddress.stateCode !== entity.stateCode;
        const gstRate = isInterState
          ? Number(product.gstConfig.igstRate)
          : Number(product.gstConfig.cgstRate) + Number(product.gstConfig.sgstRate);
        const gstAmount = roundMoney((lineSubtotal * gstRate) / 100);

        const existing = entityGroups.get(entity.id);
        if (existing) {
          existing.subtotal += lineSubtotal;
          existing.totalSets += item.sets;
          existing.totalPieces += item.sets * product.piecesPerSet;
          existing.gst += gstAmount;
          existing.items.push(item);
        } else {
          entityGroups.set(entity.id, {
            entity,
            subtotal: lineSubtotal,
            totalSets: item.sets,
            totalPieces: item.sets * product.piecesPerSet,
            gst: gstAmount,
            items: [item],
          });
        }
      }

      const shippingPerEntity = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
      const totalGst = Array.from(entityGroups.values()).reduce((sum, group) => sum + group.gst, 0);
      const shipping = Array.from(entityGroups.values()).length * shippingPerEntity;
      const masterTotal = roundMoney(subtotal + totalGst + shipping);

      const orderNumber = makeOrderNumber();

      const order = await tx.orderEnquiry.create({
        data: {
          orderNumber,
          retailerProfileId,
          retailerBusinessName: retailer.businessName,
          retailerApplicantName: retailer.applicantName,
          retailerGstin: retailer.gstin,
          retailerContact: retailer.mobile,
          retailerEmail: retailer.user.email,
          billingAddressJson: JSON.stringify(billingAddress),
          shippingAddressJson: JSON.stringify(shippingAddress),
          totalDesigns,
          totalSets,
          totalPieces,
          subtotal,
          totalGst,
          shipping,
          masterTotal,
          status: "ENQUIRY_RECEIVED",
          customerRemarks: [
            `Payment Method: CASH ON DELIVERY (COD)`,
            `Transport: ${transportAgency}`,
            preferredStation ? `Station: ${preferredStation}` : "",
            remarks ? `Remarks: ${remarks}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderEnquiryId: order.id,
          status: "ENQUIRY_RECEIVED",
          actorUserId: guard.retailerProfile.userId,
          actorName: retailer.applicantName,
          notes: "Retailer submitted master order enquiry with Cash on Delivery payment method.",
        },
      });

      // Create one seller-level order for each owner in the master order.
      // vendorId !== null  -> vendor-owned products
      // vendorId === null  -> IcchaStore/Admin-owned products
      const sellerOrderByOwner = new Map<string, string>();

      const sellerGroups = new Map<
        string,
        {
          vendorId: string | null;
          sellerName: string;
          items: typeof cart.items;
        }
      >();

      for (const item of cart.items) {
        const vendorId = item.product.vendorId;
        const ownerKey = vendorId ?? "ICCHASTORE";
        const sellerName = item.product.vendor?.businessName ?? "IcchaStore";
        const existing = sellerGroups.get(ownerKey);

        if (existing) {
          existing.items.push(item);
        } else {
          sellerGroups.set(ownerKey, {
            vendorId,
            sellerName,
            items: [item],
          });
        }
      }

      for (const group of sellerGroups.values()) {
        const sellerOrder = await tx.sellerOrder.create({
          data: {
            orderEnquiryId: order.id,
            vendorId: group.vendorId,
            sellerName: group.sellerName,
            status: "ENQUIRY_RECEIVED",
          },
        });

        sellerOrderByOwner.set(group.vendorId ?? "ICCHASTORE", sellerOrder.id);

        await tx.sellerOrderStatusHistory.create({
          data: {
            sellerOrderId: sellerOrder.id,
            status: "ENQUIRY_RECEIVED",
            actorUserId: guard.retailerProfile.userId,
            actorName: retailer.applicantName,
            notes: `Seller order created from master order ${order.orderNumber}.`,
          },
        });
      }

      for (const item of cart.items) {
        const product = item.product;
        const entity = product.gstConfig!.billingEntity;
        const isInterState = shippingAddress.stateCode !== entity.stateCode;
        const gstRate = isInterState
          ? Number(product.gstConfig!.igstRate)
          : Number(product.gstConfig!.cgstRate) + Number(product.gstConfig!.sgstRate);
        const lineSubtotal = Number(product.wholesalePricePerSet) * item.sets;
        const gstAmount = roundMoney((lineSubtotal * gstRate) / 100);
        const imageUrl = product.media[0]?.mediaAsset.publicUrl || null;
        const selectedSize = item.selectedSize === NO_SIZE ? "Assorted" : item.selectedSize;

        // Reserve the exact stock that was in the cart. For sized products,
        // reserve from both the size row and the aggregate product stock.
        if (product.category.requiresSize) {
          const sizeRow = product.sizes.find(
            (row) => row.size.toLowerCase() === item.selectedSize.toLowerCase()
          );

          if (!sizeRow) {
            throw new Error(`Size ${selectedSize} is no longer available for ${product.name}`);
          }

          const sizeUpdate = await tx.productSize.updateMany({
            where: {
              id: sizeRow.id,
              availableSets: { gte: item.sets },
            },
            data: { availableSets: { decrement: item.sets } },
          });

          if (sizeUpdate.count !== 1) {
            throw new Error(`Insufficient stock for ${product.name} in size ${selectedSize}`);
          }

          const productUpdate = await tx.product.updateMany({
            where: {
              id: product.id,
              availableSets: { gte: item.sets },
              totalAvailablePieces: { gte: item.sets * product.piecesPerSet },
            },
            data: {
              availableSets: { decrement: item.sets },
              totalAvailablePieces: { decrement: item.sets * product.piecesPerSet },
            },
          });

          if (productUpdate.count !== 1) {
            throw new Error(`Insufficient total stock for ${product.name}`);
          }
        } else {
          const productUpdate = await tx.product.updateMany({
            where: {
              id: product.id,
              availableSets: { gte: item.sets },
              totalAvailablePieces: { gte: item.sets * product.piecesPerSet },
            },
            data: {
              availableSets: { decrement: item.sets },
              totalAvailablePieces: { decrement: item.sets * product.piecesPerSet },
            },
          });

          if (productUpdate.count !== 1) {
            throw new Error(`Insufficient stock for ${product.name}`);
          }
        }

        await tx.orderItem.create({
          data: {
            orderEnquiryId: order.id,
            sellerOrderId: sellerOrderByOwner.get(product.vendorId ?? "ICCHASTORE") ?? null,
            productId: product.id,
            billingEntityId: entity.id,
            productName: product.name,
            sku: product.sku,
            designNumber: product.designNumber,
            categoryName: product.category.name,
            sets: item.sets,
            piecesPerSet: product.piecesPerSet,
            totalPieces: item.sets * product.piecesPerSet,
            pieceRate: product.wholesalePricePerPiece,
            setRate: product.wholesalePricePerSet,
            lineSubtotal,
            hsn: product.gstConfig!.hsnCode,
            gstRate,
            gstAmount,
            totalWithGst: lineSubtotal + gstAmount,
            imageUrl,
            color: product.color,
            sizeCombination: selectedSize,
          },
        });

        await tx.stockReservation.create({
          data: {
            productId: product.id,
            orderEnquiryId: order.id,
            reservedSets: item.sets,
            reservedPieces: item.sets * product.piecesPerSet,
            expiresAt: null,
            isConfirmed: false,
          },
        });
      }

      for (const [index, group] of Array.from(entityGroups.values()).entries()) {
        const isInterState = shippingAddress.stateCode !== group.entity.stateCode;
        const cgstAmount = isInterState ? 0 : roundMoney(group.gst / 2);
        const sgstAmount = isInterState ? 0 : roundMoney(group.gst / 2);
        const igstAmount = isInterState ? group.gst : 0;
        const entityShipping = shippingPerEntity;
        const grandTotal = roundMoney(group.subtotal + group.gst + entityShipping);
        const suffix = String.fromCharCode(65 + index);

        await tx.estimate.create({
          data: {
            estimateNumber: `${group.entity.estimatePrefix}${orderNumber.replace("IC-ORD-", "")}${suffix}`,
            orderEnquiryId: order.id,
            billingEntityId: group.entity.id,
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            totalSets: group.totalSets,
            totalPieces: group.totalPieces,
            taxableSubtotal: group.subtotal,
            isInterState,
            cgstAmount,
            sgstAmount,
            igstAmount,
            totalGst: group.gst,
            shippingCharge: entityShipping,
            grandTotal,
            paymentTermsJson: JSON.stringify({
              paymentMethod: "COD",
              label: "Cash on Delivery",
              note: "Payment is collected on delivery. No online payment is required.",
            }),
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return tx.orderEnquiry.findUnique({
        where: { id: order.id },
        include: {
          items: true,
          sellerOrders: {
            select: {
              id: true,
              vendorId: true,
              sellerName: true,
              status: true,
            },
          },
          estimates: {
            select: {
              id: true,
              estimateNumber: true,
              billingEntityId: true,
              grandTotal: true,
            },
          },
        },
        });
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Master order enquiry created successfully.",
        data: {
          id: result!.id,
          orderNumber: result!.orderNumber,
          status: result!.status,
          paymentMethod: "COD",
          masterTotal: Number(result!.masterTotal),
          totalGst: Number(result!.totalGst),
          shipping: Number(result!.shipping),
          sellerOrders: result!.sellerOrders,
          estimates: result!.estimates.map((estimate) => ({
            ...estimate,
            grandTotal: Number(estimate.grandTotal),
          })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create retailer order enquiry error:", error);

    const message = error instanceof Error ? error.message : "Could not create order enquiry.";

    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
