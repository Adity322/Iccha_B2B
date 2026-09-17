import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ORDER_NUMBER = "IC-ORD-39702060530";

async function main() {
  const order = await prisma.orderEnquiry.findUnique({
    where: { orderNumber: ORDER_NUMBER },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      retailerApplicantName: true,
      items: {
        select: {
          id: true,
          productId: true,
          productName: true,
          product: {
            select: {
              vendorId: true,
              vendor: {
                select: {
                  id: true,
                  businessName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error(`Order ${ORDER_NUMBER} was not found.`);
  }

  if (order.items.length === 0) {
    throw new Error(`Order ${ORDER_NUMBER} has no OrderItems.`);
  }

  const groups = new Map<
    string,
    {
      vendorId: string | null;
      sellerName: string;
      itemIds: string[];
    }
  >();

  for (const item of order.items) {
    const vendorId = item.product.vendorId ?? null;
    const key = vendorId ?? "ICCHASTORE";
    const sellerName =
      item.product.vendor?.businessName ?? "IcchaStore";

    const existing = groups.get(key);

    if (existing) {
      existing.itemIds.push(item.id);
    } else {
      groups.set(key, {
        vendorId,
        sellerName,
        itemIds: [item.id],
      });
    }
  }

  console.log(`Order: ${order.orderNumber}`);
  console.log(`Order ID: ${order.id}`);
  console.log(`Order items: ${order.items.length}`);
  console.log(`Seller groups to create/backfill: ${groups.size}`);

  await prisma.$transaction(async (tx) => {
    for (const group of groups.values()) {
      let sellerOrder = await tx.sellerOrder.findFirst({
        where: {
          orderEnquiryId: order.id,
          vendorId: group.vendorId,
        },
      });

      if (!sellerOrder) {
        sellerOrder = await tx.sellerOrder.create({
          data: {
            orderEnquiryId: order.id,
            vendorId: group.vendorId,
            sellerName: group.sellerName,
            status: order.status,
          },
        });

        await tx.sellerOrderStatusHistory.create({
          data: {
            sellerOrderId: sellerOrder.id,
            status: order.status,
            actorName: "System Backfill",
            notes: `Seller order backfilled for existing master order ${order.orderNumber}.`,
          },
        });

        console.log(
          `Created SellerOrder: ${group.sellerName} (${sellerOrder.id})`
        );
      } else {
        console.log(
          `SellerOrder already exists: ${group.sellerName} (${sellerOrder.id})`
        );
      }

      await tx.orderItem.updateMany({
        where: {
          id: { in: group.itemIds },
          orderEnquiryId: order.id,
        },
        data: {
          sellerOrderId: sellerOrder.id,
        },
      });

      console.log(
        `Attached ${group.itemIds.length} item(s) to ${group.sellerName}.`
      );
    }
  });

  const verification = await prisma.sellerOrder.findMany({
    where: {
      orderEnquiryId: order.id,
    },
    select: {
      id: true,
      vendorId: true,
      sellerName: true,
      status: true,
      items: {
        select: {
          id: true,
          productName: true,
          sellerOrderId: true,
        },
      },
    },
    orderBy: { sellerName: "asc" },
  });

  console.log("\nBackfill complete.");
  console.table(
    verification.map((sellerOrder) => ({
      sellerOrderId: sellerOrder.id,
      vendorId: sellerOrder.vendorId ?? "ICCHASTORE",
      sellerName: sellerOrder.sellerName,
      status: sellerOrder.status,
      items: sellerOrder.items.length,
    }))
  );
}

main()
  .catch((error) => {
    console.error("\nBackfill failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
