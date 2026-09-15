import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireVendor } from "@/lib/auth/guard";

const createWarehouseSchema = z.object({
    name: z.string().trim().min(1, "Warehouse name is required"),
    address: z.string().trim().optional().or(z.literal("")),
    city: z.string().trim().optional().or(z.literal("")),
    state: z.string().trim().optional().or(z.literal("")),
    pincode: z.string().trim().optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
    try {
        const auth = await requireVendor(request);

        if ("error" in auth) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: 401 }
            );
        }

        const warehouses = await prisma.warehouse.findMany({
            where: {
                vendorId: auth.vendorProfile.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({
            success: true,
            data: warehouses,
        });
    } catch (error) {
        console.error("Fetch vendor warehouses error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Something went wrong. Please try again.",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await requireVendor(request);

        if ("error" in auth) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: 401 }
            );
        }

        const body = await request.json();

        const parsed = createWarehouseSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: parsed.error.issues[0].message,
                },
                { status: 400 }
            );
        }

        const data = parsed.data;

        const warehouse = await prisma.warehouse.create({
            data: {
                vendorId: auth.vendorProfile.id,
                name: data.name,
                address: data.address || null,
                city: data.city || null,
                state: data.state || null,
                pincode: data.pincode || null,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: warehouse,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create vendor warehouse error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Something went wrong. Please try again.",
            },
            { status: 500 }
        );
    }
}