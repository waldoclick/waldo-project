import logger from "../logtail";

export type AuditActorType =
  | "admin::user"
  | "plugin::users-permissions.user"
  | "system";

export interface AuditMeta {
  actor: number | "system";
  actor_type: AuditActorType;
  data?: Record<string, unknown>;
}

export function logAuditInfo(message: string, meta: AuditMeta): void {
  logger.info(message, {
    actor: meta.actor,
    actor_type: meta.actor_type,
    data: meta.data ?? {},
  });
}

export function logAuditWarn(message: string, meta: AuditMeta): void {
  logger.warn(message, {
    actor: meta.actor,
    actor_type: meta.actor_type,
    data: meta.data ?? {},
  });
}

export function logAuditError(message: string, meta: AuditMeta): void {
  logger.error(message, {
    actor: meta.actor,
    actor_type: meta.actor_type,
    data: meta.data ?? {},
  });
}
