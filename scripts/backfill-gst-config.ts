import { prisma } from "@/lib/db";

/**
 * Resolves (creating if necessary) the GSTConfiguration row
 * based on the explicitly selected billing entity and HSN code.
 */
export async function resolveGstConfigId(
  billingEntityId: string,
  hsnCode: string
): Promise<string | null> {
  const billingEntity = await prisma.billingEntity.findFirst({
    where: {
      id: billingEntityId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (!billingEntity) {
    throw new Error("Invalid or inactive billing entity.");
  }

  const config = await prisma.gSTConfiguration.upsert({
    where: {
      billingEntityId_hsnCode: {
        billingEntityId,
        hsnCode,
      },
    },
    update: {},
    create: {
      billingEntityId,
      hsnCode,
      description: `Auto-created for HSN ${hsnCode}`,
    },
    select: {
      id: true,
    },
  });

  return config.id;
}