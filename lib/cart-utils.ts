import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

const CART_ITEM_INCLUDE = {
    product: {
        include: {
            media: {
                where: { isPrimary: true },
                take: 1,
                include: { mediaAsset: { select: { publicUrl: true } } },
            },
            vendor: { select: { businessName: true } },
            gstConfig: {
                include: { billingEntity: true },
            },
            category: { select: { requiresSize: true } },
            sizes: { orderBy: { sortOrder: "asc" } },
        },
    },
} satisfies Prisma.CartItemInclude;

type CartWithItems = Prisma.CartGetPayload<{
    include: { items: { include: typeof CART_ITEM_INCLUDE } };
}>;

export async function getOrCreateCart(retailerProfileId: string): Promise<CartWithItems> {
    let cart = await prisma.cart.findUnique({
        where: { retailerProfileId },
        include: { items: { include: CART_ITEM_INCLUDE, orderBy: { createdAt: "asc" } } },
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { retailerProfileId },
            include: { items: { include: CART_ITEM_INCLUDE, orderBy: { createdAt: "asc" } } },
        });
    }

    return cart;
}

const DEFAULT_MOQ = { minSets: 4, minPieces: 4, minDesigns: 1, minOrderValue: 0 };
const FREE_SHIPPING_THRESHOLD = 20000;
const FLAT_SHIPPING = 350;
const UNASSIGNED_ENTITY = "unassigned";

// Field names below intentionally mirror the legacy mock `Cart`/`CartItem`/
// `EntityCartSummary` shapes (lib/types) so existing cart UI components
// (GSTEntityBreakdown, MOQProgressBar) keep working unmodified once
// AppContext is wired to this real, DB-backed cart.
export async function serializeCartFull(cart: CartWithItems, retailerProfileId: string) {
    const rawItems = cart.items.map((item) => {
        const p = item.product;
        const gstRate = p.gstConfig
            ? Number(p.gstConfig.cgstRate) + Number(p.gstConfig.sgstRate)
            : 5;
        const totalPieces = item.sets * p.piecesPerSet;
        const unitPrice = Number(p.wholesalePricePerPiece);
        const setPrice = Number(p.wholesalePricePerSet);
        const lineSubtotal = setPrice * item.sets;
        const entityCode = p.gstConfig?.billingEntity?.code ?? UNASSIGNED_ENTITY;

        return {
            productId: item.productId,
            selectedSets: item.sets,
            selectedSize: item.selectedSize === "__NO_SIZE__" ? null : item.selectedSize,
            piecesPerSet: p.piecesPerSet,
            totalPieces,
            unitPrice,
            setPrice,
            lineSubtotal,
            billingEntityId: entityCode,
            product: {
                name: p.name,
                slug: p.slug,
                sku: p.sku,
                designNumber: p.designNumber,
                fabric: p.fabric,
                sizeCombination: p.sizeCombination,
                requiresSize: p.category.requiresSize,
                sizeStocks: p.sizes.map((row) => ({ size: row.size, availableSets: row.availableSets })),
                availableSets: p.availableSets,
                isActive: p.isActive,
                vendorName: p.vendor?.businessName || "IcchaStore",
                gstRate,
                hsn: p.gstConfig?.hsnCode ?? p.hsnCode,
                media: [{ url: p.media[0]?.mediaAsset?.publicUrl || null }],
            },
        };
    });

    const totalDesigns = new Set(rawItems.map((i) => i.productId)).size;
    const totalSets = rawItems.reduce((sum, i) => sum + i.selectedSets, 0);
    const totalPieces = rawItems.reduce((sum, i) => sum + i.totalPieces, 0);
    const subtotal = rawItems.reduce((sum, i) => sum + i.lineSubtotal, 0);

    // Retailer's default billing address, for interstate GST determination
    const address = await prisma.retailerAddress.findFirst({
        where: { retailerProfileId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });

    const entityCodes = Array.from(new Set(rawItems.map((i) => i.billingEntityId)));
    const realCodes = entityCodes.filter((c) => c !== UNASSIGNED_ENTITY);
    const entities = realCodes.length
        ? await prisma.billingEntity.findMany({ where: { code: { in: realCodes } } })
        : [];

    const entitySummaries = entityCodes.map((entityId) => {
        const entity = entities.find((e) => e.code === entityId) || null;
        const entItems = rawItems.filter((i) => i.billingEntityId === entityId);
        const entSets = entItems.reduce((s, i) => s + i.selectedSets, 0);
        const entPieces = entItems.reduce((s, i) => s + i.totalPieces, 0);
        const entSubtotal = entItems.reduce((s, i) => s + i.lineSubtotal, 0);
        const entGst = entItems.reduce(
            (s, i) => s + Math.round((i.lineSubtotal * i.product.gstRate) / 100),
            0
        );
        const entShipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;

        const isInterState = !!entity && !!address && address.stateCode !== entity.stateCode;
        const cgst = isInterState ? 0 : Math.round(entGst / 2);
        const sgst = isInterState ? 0 : Math.round(entGst / 2);
        const igst = isInterState ? entGst : 0;

        return {
            entityId,
            entity: entity
                ? {
                    id: entity.id,
                    code: entity.code,
                    legalName: entity.legalName,
                    tradeName: entity.tradeName,
                    gstin: entity.gstin,
                    state: entity.state,
                    stateCode: entity.stateCode,
                    registeredAddress: entity.registeredAddress,
                }
                : null,
            items: entItems,
            totalSets: entSets,
            totalPieces: entPieces,
            subtotal: entSubtotal,
            cgst,
            sgst,
            igst,
            totalGst: entGst,
            shipping: entShipping,
            total: entSubtotal + entGst + entShipping,
        };
    });

    const estimatedGst = entitySummaries.reduce((sum, e) => sum + e.totalGst, 0);
    const shippingEstimate = entitySummaries.reduce((sum, e) => sum + e.shipping, 0);
    const estimatedTotal = subtotal + estimatedGst + shippingEstimate;

    // MOQ evaluation
    const retailer = await prisma.retailerProfile.findUnique({ where: { id: retailerProfileId } });
    const hasOverride = !!retailer?.moqSetsOverride;

    let moq;
    if (hasOverride) {
        moq = {
            isMet: true,
            currentSets: totalSets,
            requiredSets: retailer!.moqSetsOverride || 1,
            currentPieces: totalPieces,
            requiredPieces: 1,
            currentDesigns: totalDesigns,
            requiredDesigns: retailer!.moqDesignsOverride || 1,
            currentOrderValue: subtotal,
            requiredOrderValue: 0,
            deficitSets: 0,
            deficitPieces: 0,
            message: "Admin MOQ Exception Active: You can place this trial order.",
            overrideApplied: true,
        };
    } else {
        const rule = await prisma.mOQRule.findFirst({
            where: { scope: "GLOBAL", isActive: true },
            orderBy: { createdAt: "desc" },
        });

        const requiredSets = rule?.minSets ?? DEFAULT_MOQ.minSets;
        const requiredPieces = rule?.minPieces ?? DEFAULT_MOQ.minPieces;
        const requiredDesigns = rule?.minDesigns ?? DEFAULT_MOQ.minDesigns;
        const requiredOrderValue = rule?.minOrderValue ? Number(rule.minOrderValue) : DEFAULT_MOQ.minOrderValue;

        const deficitSets = Math.max(0, requiredSets - totalSets);
        const deficitPieces = Math.max(0, requiredPieces - totalPieces);
        const deficitDesigns = Math.max(0, requiredDesigns - totalDesigns);
        const deficitOrderValue = Math.max(0, requiredOrderValue - subtotal);
        const isMet =
            totalSets >= requiredSets &&
            totalPieces >= requiredPieces &&
            totalDesigns >= requiredDesigns &&
            subtotal >= requiredOrderValue;

        let message = "Minimum order quantity met.";
        if (!isMet) {
            const gaps: string[] = [];
            if (deficitSets > 0) gaps.push(`${deficitSets} more set(s)`);
            if (deficitPieces > 0) gaps.push(`${deficitPieces} more piece(s)`);
            if (deficitDesigns > 0) gaps.push(`${deficitDesigns} more unique design(s)`);
            if (deficitOrderValue > 0) gaps.push(`₹${deficitOrderValue.toLocaleString("en-IN")} more in order value`);
            message = `Add ${gaps.join(", ")} to meet the minimum wholesale order quantity.`;
        }

        moq = {
            isMet,
            currentSets: totalSets,
            requiredSets,
            currentPieces: totalPieces,
            requiredPieces,
            currentDesigns: totalDesigns,
            requiredDesigns,
            currentOrderValue: subtotal,
            requiredOrderValue,
            deficitSets,
            deficitPieces,
            message,
            overrideApplied: false,
        };
    }

    return {
        id: cart.id,
        items: rawItems,
        totalDesigns,
        totalSets,
        totalPieces,
        subtotal,
        entitySummaries,
        estimatedGst,
        shippingEstimate,
        estimatedTotal,
        moq,
    };
}