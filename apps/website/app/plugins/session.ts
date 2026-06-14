export default defineNuxtPlugin(async () => {
  const user = useSessionUser();
  if (user.value) return;
  const { fetchUser } = useSessionAuth();
  try {
    await fetchUser();
  } catch {
    // Strapi unavailable — leave user null, client hydration retries.
  }
});
