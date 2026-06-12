// is-users-owner.ts
//
// Strapi v5 route policy that enforces ownership on PUT /api/users/:id.
// Denies (returns false → 403) any request where the authenticated user is not
// the owner of the target record, unless the caller has the manager role.

/**
 * Ownership policy for PUT /api/users/:id.
 *
 * - Unauthenticated callers → false (403)
 * - Manager role → true (bypass; managers may update any user)
 * - Authenticated user updating their own record → true
 * - Authenticated user updating another user's record → false (403)
 */
export default (
  policyContext: {
    state: { user?: { id: number | string; role?: { name?: string } } };
    params: { id?: string | number };
  },
  _config: Record<string, unknown>,
): boolean => {
  const user = policyContext.state.user;
  if (!user) return false;
  const roleName = (user.role?.name ?? "").toLowerCase();
  if (roleName === "manager") return true;
  return String(policyContext.params?.id) === String(user.id);
};
