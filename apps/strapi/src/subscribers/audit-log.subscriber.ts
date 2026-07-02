import type { Core } from "@strapi/strapi";

const AUDIT_LOG_UID = "api::audit-log.audit-log";

type AuditAction = "create" | "update" | "delete";

interface AuditEvent {
  model: { uid: string };
  result?: { id?: number; documentId?: string };
}

async function recordAuditEntry(
  strapi: Core.Strapi,
  event: AuditEvent,
  action: AuditAction,
): Promise<void> {
  // Recursion guard: never audit writes to the audit-log table itself.
  if (event.model.uid === AUDIT_LOG_UID) return;

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

    await strapi.db.query(AUDIT_LOG_UID).create({
      data: {
        action,
        content_type_uid: event.model.uid,
        record_id: event.result?.id ?? null,
        record_document_id: event.result?.documentId ?? null,
        actor_id: actorType === "system" ? null : (user?.id ?? null),
        actor_type: actorType,
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
// deleteMany() on ephemeral verification codes (a system-context cron). If bulk
// coverage is ever needed, add afterDeleteMany logging a single summary row
// (its result is only { count } — no per-record ids).
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
