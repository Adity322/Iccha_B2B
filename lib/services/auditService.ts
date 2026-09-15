/**
 * IcchaStore Centralized Audit Service
 * Records administrative and operational changes to ensure compliance and traceability.
 */

export interface AuditLogEntry {
  id?: string;
  actorUserId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entityType: 'HeroSlide' | 'RetailerProfile' | 'KYCApplication' | 'Product' | 'Inventory' | 'OrderEnquiry' | 'Estimate' | 'MOQRule';
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt?: string;
}

// In-Memory Fallback Audit Store for development
const memoryAuditLogs: AuditLogEntry[] = [];

export class AuditService {
  /**
   * Records a structured audit log entry
   */
  static async log(entry: AuditLogEntry): Promise<AuditLogEntry> {
    const logRecord: AuditLogEntry = {
      ...entry,
      id: entry.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: entry.createdAt || new Date().toISOString(),
      actorEmail: entry.actorEmail || 'admin@icchastore.com',
      actorRole: entry.actorRole || 'ADMIN',
    };

    memoryAuditLogs.unshift(logRecord);
    if (memoryAuditLogs.length > 500) {
      memoryAuditLogs.pop();
    }

    console.log(`[Audit] ${logRecord.action} on ${logRecord.entityType}:${logRecord.entityId} by ${logRecord.actorEmail}`);
    return logRecord;
  }

  /**
   * Retrieves recent audit logs with filtering
   */
  static async getLogs(filter?: {
    entityType?: string;
    entityId?: string;
    action?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    let result = [...memoryAuditLogs];

    if (filter?.entityType) {
      result = result.filter(l => l.entityType === filter.entityType);
    }
    if (filter?.entityId) {
      result = result.filter(l => l.entityId === filter.entityId);
    }
    if (filter?.action) {
      result = result.filter(l => l.action === filter.action);
    }

    return result.slice(0, filter?.limit || 50);
  }
}
