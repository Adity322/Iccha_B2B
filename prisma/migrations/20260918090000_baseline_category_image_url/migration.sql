-- This column already exists on the live database (added outside of a
-- tracked migration). This file exists only to bring migration history
-- back in sync with reality — see the `prisma migrate resolve --applied`
-- step in the setup instructions. It intentionally is NOT run normally.
ALTER TABLE "Category" ADD COLUMN "imageUrl" TEXT;
