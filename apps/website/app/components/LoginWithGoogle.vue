<template>
  <button
    title="Iniciar sesión con Google"
    type="button"
    class="btn btn--primary btn--block btn--google"
    :disabled="loading"
    @click="onClick"
  >
    <NuxtImg
      loading="lazy"
      decoding="async"
      src="/images/icon-google.svg"
      alt="icono de google"
      title="icono de google"
    />
    <span>Ingresa con Google</span>
  </button>
</template>

<script setup lang="ts">
const { loginWithPopup } = useProviders();
const { Swal } = useSweetAlert2();
const { login } = useAdAnalytics();
const { fetchUser } = useSessionAuth();
const appStore = useAppStore();
const meStore = useMeStore();
const loading = ref(false);

const onClick = async () => {
  loading.value = true;
  try {
    await loginWithPopup("google"); // cookie set server-side by the Nitro popup callback
    // Populate session user — proxy injects Authorization from the httpOnly cookie
    await fetchUser();
    login("google");
    meStore.reset();
    const isComplete = await meStore.isProfileComplete();
    if (!isComplete) {
      await navigateTo("/onboarding");
      return;
    }
    const redirectTo = appStore.getReferer || "/anuncios";
    appStore.clearReferer();
    await navigateTo(redirectTo);
  } catch (err) {
    const error = err as Error;
    if (error.message === "popup_closed") return;
    if (error.message === "popup_blocked") {
      Swal.fire(
        "Error",
        "Tu navegador bloqueó la ventana emergente. Permite ventanas emergentes e intenta de nuevo.",
        "error",
      );
      return;
    }
    Swal.fire("Error", "Error durante la autenticación con Google.", "error");
  } finally {
    loading.value = false;
  }
};
</script>
