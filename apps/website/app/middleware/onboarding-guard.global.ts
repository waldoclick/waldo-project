/**
 * Onboarding guard — redirects authenticated users with incomplete profiles to /onboarding.
 * Also prevents complete-profile users from accessing /onboarding (GUARD-02).
 *
 * Must run client-side only: useMeStore depends on Strapi API calls and Pinia stores
 * that are hydrated from localStorage — unavailable during SSR. Running on the server
 * would always see the empty initial state and redirect every direct URL navigation.
 *
 * Exempt routes: /login, /registro, /logout — auth pages must never trigger this guard.
 * /onboarding* paths are NOT in the exempt set: the reverse guard (GUARD-02) must still fire.
 */

const AUTH_EXEMPT_PATHS = new Set(["/login", "/registro", "/logout"]);

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  // Exempt auth pages immediately — no async work
  if (AUTH_EXEMPT_PATHS.has(to.path)) return;

  // Skip unauthenticated users — auth middleware handles login redirect
  const user = useStrapiUser();
  if (!user.value) return;

  const meStore = useMeStore();
  const profileComplete = await meStore.isProfileComplete();

  if (!profileComplete) {
    // User is already heading to onboarding — allow through to avoid redirect loop
    if (to.path.startsWith("/onboarding")) return;

    // Save return URL before redirecting (consumed by OnboardingThankyou "Volver a Waldo")
    const appStore = useAppStore();
    appStore.setReferer(to.fullPath);
    return navigateTo("/onboarding");
  }

  // GUARD-02: Complete-profile users cannot access /onboarding
  if (to.path.startsWith("/onboarding")) {
    return navigateTo("/");
  }
});
