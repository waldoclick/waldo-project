import type { Core } from "@strapi/strapi";
import { logAuditInfo } from "../utils/audit-log";

type AuditAction = "create" | "update" | "delete";

interface AuditEvent {
  model: { uid: string };
  result?: { id?: number; documentId?: string };
}

function recordAuditEntry(
  strapi: Core.Strapi,
  event: AuditEvent,
  action: AuditAction,
): void {
  try {
    const reqCtx = strapi.requestContext.get();
    const user = reqCtx?.state?.user as { id?: number } | undefined;
    const strategyName = (
      reqCtx?.state as { auth?: { strategy?: { name?: string } } } | undefined
    )?.auth?.strategy?.name;

    const actorType = !reqCtx
      ? "system"
      : strategyName === "admin"
        ? "admin::user"
        : strategyName === "users-permissions"
          ? "plugin::users-permissions.user"
          : "system";

    logAuditInfo(`Audit ${action}: ${event.model.uid}`, {
      actor: actorType === "system" ? "system" : (user?.id ?? "system"),
      actor_type: actorType,
      data: {
        content_type_uid: event.model.uid,
        record_id: event.result?.id ?? null,
        record_document_id: event.result?.documentId ?? null,
      },
    });
  } catch (error) {
    // Log and swallow — an audit-logging failure must never break the real write.
    strapi.log.error("Failed to write audit-log entry", error);
  }
}

// SCOPE BOUNDARY: this subscriber intentionally handles only the SINGULAR lifecycle
// actions. Bulk *Many operations (createMany/updateMany/deleteMany) are NOT audited.
// The only bulk call in this codebase is verification-code-cleanup.cron.ts's
// deleteMany() on ephemeral verification codes (a system-context cron).
export default (strapi: Core.Strapi): void => {
  strapi.db.lifecycles.subscribe({
    afterCreate: (event) =>
      recordAuditEntry(strapi, event as AuditEvent, "create"),
    afterUpdate: (event) =>
      recordAuditEntry(strapi, event as AuditEvent, "update"),
    afterDelete: (event) =>
      recordAuditEntry(strapi, event as AuditEvent, "delete"),
  });
};
