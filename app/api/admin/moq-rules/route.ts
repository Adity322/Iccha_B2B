import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/guard";
import { AuditService } from "@/lib/services/auditService";
import {
  DEFAULT_MOQ,
  SETTING_ALLOW_SAMPLE_ORDERS,
  getAllowSampleOrders,
  getGlobalMoqRule,
} from "@/lib/moq";

const updateSchema = z.object({
  minSets: z.number().int().min(1, "Minimum sets must be at least 1").max(50),
  minPieces: z.number().int().min(1).max(5000).optional(),
  minDesigns: z.number().int().min(1).max(50).optional(),
  minOrderValue: z.number().min(0).max(10_000_000).nullable().optional(), // null / 0 = no value minimum
  allowSampleOrders: z.boolean().optional(),
});

async function readPolicy() {
  const [rule, allowSampleOrders] = await Promise.all([getGlobalMoqRule(prisma), getAllowSampleOrders(prisma)]);
  return {
    minSets: rule.minSets,
    minPieces: rule.minPieces,
    minDesigns: rule.minDesigns,
    minOrderValue: rule.minOrderValue,
    allowSampleOrders,
    updatedAt: rule.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireStaff(request);
  if ("error" in auth) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    return NextResponse.json({ success: true, data: await readPolicy() });
  } catch (error) {
    console.error("MOQ policy load error:", error);
    return NextResponse.json({ success: false, error: "Failed to load MOQ policy" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireStaff(request);
  if ("error" in auth) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }

  try {
    const parsed = updateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }
    const input = parsed.data;
    const before = await readPolicy();

    await prisma.$transaction(async (tx) => {
      // Update the exact row checkout reads (newest active GLOBAL rule) so the two can never diverge.
      const current = await tx.mOQRule.findFirst({
        where: { scope: "GLOBAL", isActive: true },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      const values = {
        minSets: input.minSets,
        ...(input.minPieces !== undefined ? { minPieces: input.minPieces } : {}),
        ...(input.minDesigns !== undefined ? { minDesigns: input.minDesigns } : {}),
        ...(input.minOrderValue !== undefined ? { minOrderValue: input.minOrderValue } : {}),
      };

      if (current) {
        await tx.mOQRule.update({ where: { id: current.id }, data: values });
      } else {
        await tx.mOQRule.create({
          data: {
            scope: "GLOBAL",
            minPieces: DEFAULT_MOQ.minPieces, // schema default is 16 — keep today's effective behaviour instead
            minDesigns: DEFAULT_MOQ.minDesigns,
            ...values,
          },
        });
      }

      if (input.allowSampleOrders !== undefined) {
        await tx.siteSetting.upsert({
          where: { key: SETTING_ALLOW_SAMPLE_ORDERS },
          create: {
            key: SETTING_ALLOW_SAMPLE_ORDERS,
            value: String(input.allowSampleOrders),
            description: "Allow retailers to request a sample / video call",
          },
          update: { value: String(input.allowSampleOrders) },
        });
      }
    });

    const after = await readPolicy();

    AuditService.log({
      actorUserId: auth.user.id,
      actorEmail: auth.user.email,
      actorRole: auth.user.role,
      action: "MOQ_RULE_UPDATED",
      entityType: "MOQRule",
      entityId: "GLOBAL",
      metadata: { before, after },
    }).catch((e) => console.error("Audit log failed:", e));

    return NextResponse.json({ success: true, data: after });
  } catch (error) {
    console.error("MOQ policy save error:", error);
    return NextResponse.json({ success: false, error: "Failed to save MOQ policy" }, { status: 500 });
  }
}