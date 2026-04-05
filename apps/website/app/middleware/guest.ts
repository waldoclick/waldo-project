export default defineNuxtRouteMiddleware((_to, _from) => {
  const user = useStrapiUser();
  if (user.value) {
    return navigateTo("/");
  }
});
