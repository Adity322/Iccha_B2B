import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const PENDING_STATUSES = ["APPLICATION_RECEIVED", "UNDER_REVIEW", "ADDITIONAL_INFORMATION_REQUIRED"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { retailerProfile: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Approval gate — retailers only, staff roles skip this entirely
    if (user.role === "RETAILER") {
      const status = user.retailerProfile?.status;

      if (status && PENDING_STATUSES.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: "PENDING_APPROVAL",
            message: "Your application is awaiting admin approval.",
          },
          { status: 403 }
        );
      }

      if (status === "REJECTED" || status === "SUSPENDED") {
        return NextResponse.json(
          {
            success: false,
            error: status,
            message:
              status === "REJECTED"
                ? "Your application was not approved. Contact support for details."
                : "Your account has been suspended. Contact support.",
          },
          { status: 403 }
        );
      }
    }
    if (user.role === "VENDOR") {
      const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
      if (!vendorProfile || !vendorProfile.isActive) {
        return NextResponse.json(
          { success: false, error: "SUSPENDED", message: "Your vendor account is inactive. Contact support." },
          { status: 403 }
        );
      }
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await createSessionToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        retailerStatus: user.retailerProfile?.status,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}