import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff, requireVendor } from "@/lib/auth/guard";

async function authenticateEither(request: NextRequest) {
    const staffResult = await requireStaff(request);

    if (!("error" in staffResult)) {
        return { kind: "staff" as const, ...staffResult };
    }

    const vendorResult = await requireVendor(request);

    if (!("error" in vendorResult)) {
        return { kind: "vendor" as const, ...vendorResult };
    }

    return {
        error: "Admin or vendor access required",
        status: 401 as const,
    };
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await authenticateEither(request);

        if ("error" in auth) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        }

        const { id } = await params;

        const warehouse = await prisma.warehouse.findUnique({
            where: { id },
        });

        if (!warehouse) {
            return NextResponse.json(
                { success: false, error: "Warehouse not found" },
                { status: 404 }
            );
        }

        // Vendors can only remove their own warehouses. Staff can only
        // remove platform-owned warehouses (vendorId = null) — a vendor's
        // warehouse stays under that vendor's own control.
        const owns =
            auth.kind === "vendor"
                ? warehouse.vendorId === auth.vendorProfile.id
                : warehouse.vendorId === null;

        if (!owns) {
            return NextResponse.json(
                { success: false, error: "You don't have permission to delete this warehouse" },
                { status: 403 }
            );
        }

        const productCount = await prisma.product.count({
            where: { warehouseId: id },
        });

        if (productCount > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Cannot delete: ${productCount} product${
                        productCount === 1 ? " is" : "s are"
                    } still assigned to this warehouse. Reassign or remove them first.`,
                },
                { status: 409 }
            );
        }

        await prisma.warehouse.delete({ where: { id } });

        return NextResponse.json({ success: true, message: "Warehouse deleted" });
    } catch (error) {
        console.error("Delete warehouse error:", error);

        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}