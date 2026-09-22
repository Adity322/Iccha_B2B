import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/guard";

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  mobile: z.string().trim().optional().or(z.literal("")),

  bankName: z.string().trim().optional().or(z.literal("")),
  accountHolder: z.string().trim().optional().or(z.literal("")),
  accountNumber: z.string().trim().optional().or(z.literal("")),
  ifsc: z.string().trim().optional().or(z.literal("")),
  branch: z.string().trim().optional().or(z.literal("")),
  upiId: z.string().trim().optional().or(z.literal("")),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireStaff(request);

    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const bankDetails = await prisma.staffBankDetails.findUnique({
      where: {
        userId: auth.user.id,
      },
      select: {
        bankName: true,
        accountHolder: true,
        accountNumber: true,
        ifsc: true,
        branch: true,
        upiId: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        name: auth.user.name,
        email: auth.user.email,
        mobile: auth.user.mobile,
        role: auth.user.role,
        createdAt: auth.user.createdAt,
        lastLoginAt: auth.user.lastLoginAt,
        bankDetails,
      },
    });
  } catch (error) {
    console.error("Fetch admin profile error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireStaff(request);

    if ("error" in auth) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();

    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      mobile,
      bankName,
      accountHolder,
      accountNumber,
      ifsc,
      branch,
      upiId,
    } = parsed.data;

    const updated = await prisma.$transaction(async tx => {
      const user = await tx.user.update({
        where: {
          id: auth.user.id,
        },
        data: {
          name,
          email,
          mobile: mobile || null,
        },
        select: {
          name: true,
          email: true,
          mobile: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
        },
      });

      const hasBankDetails =
        bankName ||
        accountHolder ||
        accountNumber ||
        ifsc ||
        branch ||
        upiId;

      let bankDetails = null;

      if (hasBankDetails) {
        bankDetails = await tx.staffBankDetails.upsert({
          where: {
            userId: auth.user.id,
          },
          create: {
            userId: auth.user.id,
            bankName: bankName || "",
            accountHolder: accountHolder || "",
            accountNumber: accountNumber || "",
            ifsc: ifsc || "",
            branch: branch || null,
            upiId: upiId || null,
          },
          update: {
            bankName: bankName || "",
            accountHolder: accountHolder || "",
            accountNumber: accountNumber || "",
            ifsc: ifsc || "",
            branch: branch || null,
            upiId: upiId || null,
          },
          select: {
            bankName: true,
            accountHolder: true,
            accountNumber: true,
            ifsc: true,
            branch: true,
            upiId: true,
          },
        });
      } else {
        bankDetails = await tx.staffBankDetails.findUnique({
          where: {
            userId: auth.user.id,
          },
          select: {
            bankName: true,
            accountHolder: true,
            accountNumber: true,
            ifsc: true,
            branch: true,
            upiId: true,
          },
        });
      }

      return {
        ...user,
        bankDetails,
      };
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Another account is already using this email address.",
        },
        { status: 409 }
      );
    }

    console.error("Update admin profile error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}