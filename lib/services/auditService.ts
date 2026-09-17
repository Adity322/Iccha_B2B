import { prisma } from "@/lib/db";

export interface AuditLogEntry {
  id?: string;

  actorUserId?: string;
  actorEmail?: string;
  actorRole?: string;

  action: string;

  entityType:
    | "HeroSlide"
    | "RetailerProfile"
    | "KYCApplication"
    | "Product"
    | "Inventory"
    | "OrderEnquiry"
    | "Estimate"
    | "MOQRule";

  entityId: string;

  metadata?: Record<string, unknown>;

  ipAddress?: string;

  createdAt?: string;
}

export class AuditService {
  static async log(
    entry: AuditLogEntry
  ): Promise<AuditLogEntry> {
    const createdAt =
      entry.createdAt
        ? new Date(entry.createdAt)
        : new Date();

    const record =
      await prisma.auditLog.create({
        data: {
          actorUserId:
            entry.actorUserId || null,

          actorEmail:
            entry.actorEmail || null,

          actorRole:
            entry.actorRole || null,

          action: entry.action,

          entityType:
            entry.entityType,

          entityId:
            entry.entityId,

          metadataJson:
            entry.metadata
              ? JSON.stringify(entry.metadata)
              : null,

          ipAddress:
            entry.ipAddress || null,

          createdAt,
        },
      });

    return {
      id: record.id,

      actorUserId:
        record.actorUserId || undefined,

      actorEmail:
        record.actorEmail || undefined,

      actorRole:
        record.actorRole || undefined,

      action:
        record.action,

      entityType:
        record.entityType as AuditLogEntry["entityType"],

      entityId:
        record.entityId,

      metadata:
        record.metadataJson
          ? JSON.parse(record.metadataJson)
          : undefined,

      ipAddress:
        record.ipAddress || undefined,

      createdAt:
        record.createdAt.toISOString(),
    };
  }

  static async getLogs(filter?: {
    entityType?: string;
    entityId?: string;
    action?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    const logs =
      await prisma.auditLog.findMany({
        where: {
          entityType:
            filter?.entityType,

          entityId:
            filter?.entityId,

          action:
            filter?.action,
        },

        orderBy: {
          createdAt: "desc",
        },

        take:
          filter?.limit || 50,
      });

    return logs.map((log) => ({
      id: log.id,

      actorUserId:
        log.actorUserId || undefined,

      actorEmail:
        log.actorEmail || undefined,

      actorRole:
        log.actorRole || undefined,

      action: log.action,

      entityType:
        log.entityType as AuditLogEntry["entityType"],

      entityId:
        log.entityId,

      metadata:
        log.metadataJson
          ? JSON.parse(log.metadataJson)
          : undefined,

      ipAddress:
        log.ipAddress || undefined,

      createdAt:
        log.createdAt.toISOString(),
    }));
  }
}