import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireStaff } from "@/lib/auth/guard";

export async function GET(request: NextRequest) {
  const guard = await requireStaff(request);

  if ("error" in guard) {
    return NextResponse.json(
      {
        success: false,
        error: guard.error,
      },
      {
        status: guard.status,
      }
    );
  }

  try {
    /*
     * Get all reactivation request events.
     */
    const requestLogs = await prisma.auditLog.findMany({
      where: {
        action: "RETAILER_REACTIVATION_REQUESTED",
        entityType: "RetailerProfile",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (requestLogs.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    /*
     * For each retailer, determine the latest reactivation event.
     */
    const retailerIds = [
      ...new Set(requestLogs.map((log) => log.entityId)),
    ];

    const allReactivationLogs =
      await prisma.auditLog.findMany({
        where: {
          entityType: "RetailerProfile",
          entityId: {
            in: retailerIds,
          },
          action: {
            in: [
              "RETAILER_REACTIVATION_REQUESTED",
              "RETAILER_REACTIVATION_APPROVED",
              "RETAILER_REACTIVATION_REJECTED",
            ],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const latestEventByRetailer = new Map<
      string,
      (typeof allReactivationLogs)[number]
    >();

    for (const log of allReactivationLogs) {
      if (!latestEventByRetailer.has(log.entityId)) {
        latestEventByRetailer.set(log.entityId, log);
      }
    }

    /*
     * Only retailers whose latest event is REQUESTED
     * are actually pending.
     */
    const pendingRetailerIds = retailerIds.filter(
      (id) =>
        latestEventByRetailer.get(id)?.action ===
        "RETAILER_REACTIVATION_REQUESTED"
    );

    if (pendingRetailerIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const retailers =
      await prisma.retailerProfile.findMany({
        where: {
          id: {
            in: pendingRetailerIds,
          },
          status: "DEACTIVATED",
        },
        include: {
          user: {
            select: {
              email: true,
              isActive: true,
            },
          },
        },
      });

    const retailerMap = new Map(
      retailers.map((retailer) => [
        retailer.id,
        retailer,
      ])
    );

    const data = pendingRetailerIds
      .map((retailerId) => {
        const retailer = retailerMap.get(retailerId);
        const requestLog =
          latestEventByRetailer.get(retailerId);

        if (!retailer || !requestLog) {
          return null;
        }

        let metadata: Record<string, unknown> = {};

        if (requestLog.metadataJson) {
          try {
            metadata = JSON.parse(
              requestLog.metadataJson
            );
          } catch {
            metadata = {};
          }
        }

        return {
          id: retailer.id,
          businessName: retailer.businessName,
          applicantName: retailer.applicantName,
          mobile: retailer.mobile,
          email: retailer.user.email,
          gstin: retailer.gstin,
          businessType: retailer.businessType,
          status: retailer.status,
          deactivatedAt: retailer.deactivatedAt,
          lastActivityAt: retailer.lastActivityAt,

          requestId: requestLog.id,
          requestedAt: requestLog.createdAt,

          requestReason:
            typeof metadata.reason === "string"
              ? metadata.reason
              : null,
        };
      })
      .filter(
        (
          item
        ): item is NonNullable<typeof item> =>
          item !== null
      );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "[admin/retailer-reactivation-requests] GET failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to load reactivation requests.",
      },
      {
        status: 500,
      }
    );
  }
}