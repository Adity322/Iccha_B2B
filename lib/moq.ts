import type { Prisma, PrismaClient } from "@prisma/client";


type Db = PrismaClient | Prisma.TransactionClient;

export const DEFAULT_MOQ = { minSets: 4, minPieces: 4, minDesigns: 1, minOrderValue: 0 };

export const SETTING_ALLOW_SAMPLE_ORDERS = "moq.allowSampleOrders";

export async function getGlobalMoqRule(db: Db) {
  const rule = await db.mOQRule.findFirst({
    where: { scope: "GLOBAL", isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return {
    id: rule?.id ?? null,
    minSets: rule?.minSets ?? DEFAULT_MOQ.minSets,
    minPieces: rule?.minPieces ?? DEFAULT_MOQ.minPieces,
    minDesigns: rule?.minDesigns ?? DEFAULT_MOQ.minDesigns,
    minOrderValue: rule?.minOrderValue ? Number(rule.minOrderValue) : DEFAULT_MOQ.minOrderValue,
    updatedAt: rule?.updatedAt ?? null,
  };
}

/** The retailer's current admin-granted override, if any (not deactivated, not expired). */
export async function getActiveMoqOverride(db: Db, retailerProfileId: string) {
  return db.mOQOverride.findFirst({
    where: {
      retailerProfileId,
      isUsed: false,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Whether retailers may request a sample / video call. Defaults to on. */
export async function getAllowSampleOrders(db: Db): Promise<boolean> {
  const row = await db.siteSetting.findUnique({ where: { key: SETTING_ALLOW_SAMPLE_ORDERS } });
  return row ? row.value !== "false" : true;
}

type MoqInput = {
  retailerProfileId: string;
  totalSets: number;
  totalPieces: number;
  totalDesigns: number;
  subtotal: number;
};

export async function evaluateMoq(db: Db, input: MoqInput) {
  const { totalSets, totalPieces, totalDesigns, subtotal } = input;
  const override = await getActiveMoqOverride(db, input.retailerProfileId);

  if (override) {
    const requiredSets = override.permittedMinSets;
    const isMet = totalSets >= requiredSets && totalSets >= 1;
    const deficitSets = Math.max(0, requiredSets - totalSets);
    return {
      isMet,
      currentSets: totalSets,
      requiredSets,
      currentPieces: totalPieces,
      requiredPieces: 1,
      currentDesigns: totalDesigns,
      requiredDesigns: 1,
      currentOrderValue: subtotal,
      requiredOrderValue: 0,
      deficitSets,
      deficitPieces: 0,
      message: isMet
        ? "Admin MOQ Exception Active: You can place this trial order."
        : `Your account has a custom minimum of ${requiredSets} set(s). Add ${deficitSets} more set(s) to place this order.`,
      blockMessage: `Minimum order not met. Your account requires at least ${requiredSets} set(s).`,
      overrideApplied: true,
    };
  }

  const rule = await getGlobalMoqRule(db);
  const deficitSets = Math.max(0, rule.minSets - totalSets);
  const deficitPieces = Math.max(0, rule.minPieces - totalPieces);
  const deficitDesigns = Math.max(0, rule.minDesigns - totalDesigns);
  const deficitOrderValue = Math.max(0, rule.minOrderValue - subtotal);

  const isMet =
    totalSets >= rule.minSets &&
    totalPieces >= rule.minPieces &&
    totalDesigns >= rule.minDesigns &&
    subtotal >= rule.minOrderValue;

  let message = "Minimum order quantity met.";
  if (!isMet) {
    const gaps: string[] = [];
    if (deficitSets > 0) gaps.push(`${deficitSets} more set(s)`);
    if (deficitPieces > 0) gaps.push(`${deficitPieces} more piece(s)`);
    if (deficitDesigns > 0) gaps.push(`${deficitDesigns} more unique design(s)`);
    if (deficitOrderValue > 0) gaps.push(`₹${deficitOrderValue.toLocaleString("en-IN")} more in order value`);
    message = `Add ${gaps.join(", ")} to meet the minimum wholesale order quantity.`;
  }

  return {
    isMet,
    currentSets: totalSets,
    requiredSets: rule.minSets,
    currentPieces: totalPieces,
    requiredPieces: rule.minPieces,
    currentDesigns: totalDesigns,
    requiredDesigns: rule.minDesigns,
    currentOrderValue: subtotal,
    requiredOrderValue: rule.minOrderValue,
    deficitSets,
    deficitPieces,
    message,
    blockMessage: `Minimum wholesale order not met. Required: ${rule.minSets} sets, ${rule.minPieces} pieces, ${rule.minDesigns} design(s)`,
    overrideApplied: false,
  };
}