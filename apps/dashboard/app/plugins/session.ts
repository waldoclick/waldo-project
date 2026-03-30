export default defineNuxtPlugin(async () => {
  const user = useSessionUser();
  if (!user.value) {
    const { fetchUser } = useSessionAuth();
    await fetchUser();
  }
});
