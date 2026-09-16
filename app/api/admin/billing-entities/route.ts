import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff, requireVendor } from "@/lib/auth/guard";

export async function GET(request: NextRequest) {
    try {
        const staff = await requireStaff(request);

        if ("error" in staff) {
            const vendor = await requireVendor(request);

            if ("error" in vendor) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Admin or vendor access required",
                    },
                    { status: 401 }
                );
            }
        }

        const entities = await prisma.billingEntity.findMany({
            where: {
                isActive: true,
            },
            select: {
                id: true,
                code: true,
                legalName: true,
                tradeName: true,
                gstin: true,
                state: true,
                stateCode: true,
                defaultGstRate: true,
            },
            orderBy: {
                code: "asc",
            },
        });

        return NextResponse.json({
            success: true,
            data: entities,
        });
    } catch (error) {
        console.error("Get billing entities error:", error);

        return NextResponse.json(
            {
                success: false,
                error: "Could not load billing entities.",
            },
            { status: 500 }
        );
    }
}