export default defineNuxtRouteMiddleware((_to, _from) => {
  const user = useSessionUser();
  if (user.value) {
    return navigateTo("/");
  }
});
