/**
 * One-time backfill: assigns a short, unique `vendorCode` to every VendorProfile
 * that doesn't already have one. Derives the code from businessName, falling back
 * to increasingly longer variants (and finally a numeric suffix) on collision.
 *
 * Run with: npx tsx scripts/backfill-vendor-code.ts
 * (or: npx ts-node scripts/backfill-vendor-code.ts)
 *
 * Safe to re-run — vendors that already have a vendorCode are skipped.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function baseCode(businessName: string): string {
  // Strip anything that isn't a letter, uppercase, take first 3 chars.
  // "Raj Textiles" -> "RAJ", "3-Star Fabrics" -> "STA" (digits dropped, letters only)
  const letters = businessName.toUpperCase().replace(/[^A-Z]/g, "");
  const code = letters.slice(0, 3);
  return code.length >= 2 ? code : code.padEnd(3, "X"); // guard against very short/odd names
}

async function generateUniqueCode(
  businessName: string,
  taken: Set<string>
): Promise<string> {
  const base = baseCode(businessName);

  // Try the plain 3-letter code first.
  if (!taken.has(base)) return base;

  // Then try 4- and 5-letter variants pulled from the business name.
  const letters = businessName.toUpperCase().replace(/[^A-Z]/g, "");
  for (const len of [4, 5]) {
    const candidate = letters.slice(0, len);
    if (candidate.length === len && !taken.has(candidate)) return candidate;
  }

  // Last resort: numeric suffix on the base code (RAJ1, RAJ2, ...).
  for (let n = 1; n < 1000; n++) {
    const candidate = `${base}${n}`;
    if (!taken.has(candidate)) return candidate;
  }

  throw new Error(`Could not generate a unique vendorCode for "${businessName}"`);
}

async function main() {
  const vendors = await prisma.vendorProfile.findMany({
    select: { id: true, businessName: true, vendorCode: true },
    orderBy: { createdAt: "asc" }, // stable order so earlier vendors keep the "cleanest" codes
  });

  const taken = new Set(
    vendors.map((v) => v.vendorCode).filter((c): c is string => Boolean(c))
  );

  const toUpdate = vendors.filter((v) => !v.vendorCode);

  console.log(`Found ${vendors.length} vendors, ${toUpdate.length} need a vendorCode.`);

  let updated = 0;
  for (const vendor of toUpdate) {
    const code = await generateUniqueCode(vendor.businessName, taken);
    taken.add(code);

    await prisma.vendorProfile.update({
      where: { id: vendor.id },
      data: { vendorCode: code },
    });

    console.log(`  ${vendor.businessName} -> ${code}`);
    updated++;
  }

  console.log(`Done. Updated ${updated} vendor(s).`);
}

main()
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });