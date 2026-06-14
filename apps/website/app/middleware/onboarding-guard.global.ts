/**
 * Onboarding guard — redirects authenticated users with incomplete profiles to /onboarding.
 * Also prevents complete-profile users from accessing the /onboarding form (GUARD-02).
 *
 * Runs on both SSR and client: the JWT is stored in a cookie (waldo_jwt), so
 * @nuxtjs/strapi can authenticate API calls server-side. Removing the SSR skip ensures
 * that direct URL loads (refresh) also enforce the onboarding requirement.
 *
 * Client hydration race: on first client render, useStrapiUser may not be populated yet
 * if fetchUser() is still pending. We resolve this by checking the token first and
 * awaiting fetchUser() when needed.
 *
 * Exempt routes: /login, /registro, /logout — auth pages must never trigger this guard.
 * /onboarding/thankyou is NOT blocked by GUARD-02 — users who just completed onboarding
 * must be able to reach it even though their profile is now complete.
 */

const AUTH_EXEMPT_PATHS = new Set(["/login", "/registro", "/logout"]);

export default defineNuxtRouteMiddleware(async (to) => {
  // Exempt auth pages immediately — no async work
  if (AUTH_EXEMPT_PATHS.has(to.path)) return;

  // Resolve user — on client hydration the Strapi plugin may still be fetching
  const user = useStrapiUser();
  if (!user.value) {
    const token = useStrapiToken();
    if (!token.value) return; // No JWT → not logged in
    // SSR fail-open: fetchUser() on server calls Strapi directly without X-Proxy-Key.
    // proxy-auth rejects with 401, and @nuxtjs/strapi clears the token in its catch block.
    // Returning here preserves the token so that the page-level auth middleware can do
    // its own SSR fail-open. Client hydration re-runs this guard with user populated.
    if (import.meta.server) return;
    const { fetchUser } = useStrapiAuth();
    try {
      await fetchUser();
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
