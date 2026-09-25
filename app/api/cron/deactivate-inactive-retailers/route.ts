import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// How long a retailer can go with no meaningful activity (add-to-cart / place-order)
// before their account is auto-deactivated.
const INACTIVITY_LIMIT_DAYS = 15;

/**
 * Vercel Cron hits this route once a day (see vercel.json).
 * Auth: Vercel signs cron requests with the CRON_SECRET as a Bearer token
 * automatically — no extra setup needed beyond setting the env var.
 * See: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - INACTIVITY_LIMIT_DAYS);

  try {
    // Only APPROVED retailers can go inactive/deactivated — applications still
    // pending, rejected, or already suspended/deactivated are left alone.
    // A retailer who has never had any recorded activity (lastActivityAt is
    // null) is measured from their approval date via createdAt as a fallback,
    // so brand-new approvals aren't deactivated on day one.
    const candidates = await prisma.retailerProfile.findMany({
      where: {
        status: "APPROVED",
        OR: [
          { lastActivityAt: { lt: cutoff } },
          { lastActivityAt: null, createdAt: { lt: cutoff } },
        ],
      },
      select: { id: true, businessName: true, lastActivityAt: true, createdAt: true },
    });

    if (candidates.length === 0) {
      return NextResponse.json({ success: true, deactivatedCount: 0, retailers: [] });
    }

    const now = new Date();

    const result = await prisma.retailerProfile.updateMany({
      where: { id: { in: candidates.map((c) => c.id) } },
      data: { status: "DEACTIVATED", deactivatedAt: now },
    });

    // Audit trail — one row per retailer, consistent with how other admin
    // actions in this app are logged.
    await prisma.auditLog.createMany({
      data: candidates.map((c) => ({
        action: "RETAILER_AUTO_DEACTIVATED",
        entityType: "RetailerProfile",
        entityId: c.id,
        metadataJson: JSON.stringify({
          reason: "inactivity",
          inactivityLimitDays: INACTIVITY_LIMIT_DAYS,
          lastActivityAt: c.lastActivityAt,
        }),
      })),
    });

    return NextResponse.json({
      success: true,
      deactivatedCount: result.count,
      retailers: candidates.map((c) => ({ id: c.id, businessName: c.businessName })),
    });
  } catch (error) {
    console.error("[cron/deactivate-inactive-retailers] failed:", error);
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 });
  }
}