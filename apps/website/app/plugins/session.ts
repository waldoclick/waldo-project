export default defineNuxtPlugin(async () => {
  // INACTIVE until plan 129-06 removes @nuxtjs/strapi.
  // Running this while the module's auto-fetch plugin is alive causes
  // split-brain (two fetchUser writers: session_user vs strapi_user).
  // Plan 06 deletes this guard line as the cutover step.
  if (true) return; // PLAN-06-REMOVE-THIS-LINE

  const user = useSessionUser();
  if (user.value) return;
  const { fetchUser } = useSessionAuth();
  try {
    await fetchUser();
  } catch {
    // Strapi unavailable — leave user null, client hydration retries.
  }
});
