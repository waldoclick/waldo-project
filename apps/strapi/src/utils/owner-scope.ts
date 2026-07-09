import type { Context } from "koa";

/** True when the request's user has the manager role. */
export const isManagerCtx = (ctx: Context): boolean =>
  (
    (ctx.state?.user as { role?: { name?: string } } | undefined)?.role?.name ??
    ""
  ).toLowerCase() === "manager";

/**
 * Restrict a collection `find` to the calling user for non-managers by forcing
 * `filters.user = <callerId>` on `ctx.query`. Any client-supplied `user` filter is
 * stripped first so it cannot widen the scope (IDOR). Managers are left untouched.
 *
 * Used by controllers whose records belong to a `user` relation and whose reads
 * would otherwise leak every user's rows to any authenticated caller.
 */
export const scopeReadToOwner = (ctx: Context): void => {
  if (isManagerCtx(ctx)) return;
  const userId = (ctx.state?.user as { id?: number | string } | undefined)?.id;
  const query = (ctx.query ?? {}) as Record<string, unknown>;
  const rawFilters =
    typeof query.filters === "object" && query.filters !== null
      ? { ...(query.filters as Record<string, unknown>) }
      : {};
  delete rawFilters.user;
  ctx.query = { ...query, filters: { ...rawFilters, user: userId } };
};
