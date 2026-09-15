import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireVendor } from "@/lib/auth/guard";

// A vendor can edit their own contact, address, and bank details — but NOT:
// - gstin / pan          (compliance-sensitive; changing these needs a KYC-style review)
// - vendorCode           (baked into every SKU already generated under it)
// - invoicePrefix        (already printed on past invoices)
// - defaultGstRate       (billing-sensitive, admin-controlled)
// - isActive              (admin-controlled account status)
// Those fields are simply not part of this schema, so even if a client sends
// them they're silently ignored by Zod's default (strip unknown keys) behavior.
const updateProfileSchema = z.object({
    businessName: z.string().trim().min(1).optional(),
    contactName: z.string().trim().min(1),
    mobile: z.string().trim().min(1),
    address: z.string().trim().min(1),
    city: z.string().trim().min(1),
    state: z.string().trim().min(1),
    stateCode: z.string().trim().min(1),
    bankName: z.string().trim().optional().or(z.literal("")),
    accountHolder: z.string().trim().optional().or(z.literal("")),
    accountNumber: z.string().trim().optional().or(z.literal("")),
    ifsc: z.string().trim().optional().or(z.literal("")),
    branch: z.string().trim().optional().or(z.literal("")),
    upiId: z.string().trim().optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
    try {
        const auth = await requireVendor(request);
        if ("error" in auth) {
            return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
        }

        const profile = await prisma.vendorProfile.findUnique({
            where: { id: auth.vendorProfile.id },
            include: {
                _count: { select: { products: true } },
            },
        });

        if (!profile) {
            return NextResponse.json({ success: false, error: "Vendor profile not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: profile });
    } catch (error) {
        console.error("Fetch vendor profile error:", error);
        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const auth = await requireVendor(request);
        if ("error" in auth) {
            return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
        }

        const body = await request.json();
        const parsed = updateProfileSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const data = parsed.data;

        const updated = await prisma.vendorProfile.update({
            where: { id: auth.vendorProfile.id },
            data: {
                contactName: data.contactName,
                mobile: data.mobile,
                address: data.address,
                city: data.city,
                state: data.state,
                stateCode: data.stateCode,
                bankName: data.bankName || null,
                accountHolder: data.accountHolder || null,
                accountNumber: data.accountNumber || null,
                ifsc: data.ifsc || null,
                branch: data.branch || null,
                upiId: data.upiId || null,
            },
        });
        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return NextResponse.json(
                { success: false, error: "Another account is already using one of these values." },
                { status: 409 }
            );
        }
        console.error("Update vendor profile error:", error);
        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}