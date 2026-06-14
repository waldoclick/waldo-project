/**
 * Onboarding guard — redirects authenticated users with incomplete profiles to /onboarding.
 * Also prevents complete-profile users from accessing the /onboarding form (GUARD-02).
 *
 * SSR fail-open: skip on server; client hydration re-runs this guard after the session
 * plugin has populated user state via fetchUser(). Pattern per D-03.
 *
 * Exempt routes: /login, /registro, /logout — auth pages must never trigger this guard.
 * /onboarding/thankyou is NOT blocked by GUARD-02 — users who just completed onboarding
 * must be able to reach it even though their profile is now complete.
 */

const AUTH_EXEMPT_PATHS = new Set(["/login", "/registro", "/logout"]);

export default defineNuxtRouteMiddleware(async (to) => {
  // Exempt auth pages immediately — no async work
  if (AUTH_EXEMPT_PATHS.has(to.path)) return;

  // SSR fail-open: token is httpOnly — unreadable client-side; skip on server
  if (import.meta.server) return;

  // Resolve user — on client hydration the session plugin may still be fetching
  const user = useSessionUser();
  if (!user.value) {
    const { fetchUser } = useSessionAuth();
    try {
      await fetchUser(); // 401 = anonymous; sets user.value = null silently
    } catch {
      /* Strapi unavailable — treat as unauthenticated */
    }
  }
  if (!user.value) return; // Still null after fetch → not logged in

  const roleName = (
    user.value as { role?: { name?: string } }
  ).role?.name?.toLowerCase();
  if (roleName === "manager") return; // managers bypass onboarding entirely

  const meStore = useMeStore();
  const profileComplete = await meStore.isProfileComplete().catch(() => false);

  if (!profileComplete) {
    // User is already heading to onboarding — allow through to avoid redirect loop
    if (to.path.startsWith("/onboarding")) return;

    return navigateTo("/onboarding");
  }

  // GUARD-02: Complete-profile users cannot access the onboarding form.
  // /onboarding/thankyou is exempt — users who just finished onboarding land here.
  if (to.path === "/onboarding") {
    return navigateTo("/");
  }
});
