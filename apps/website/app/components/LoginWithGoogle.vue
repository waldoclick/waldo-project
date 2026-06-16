<template>
  <button
    title="Continuar con Google"
    type="button"
    class="btn btn--primary btn--block btn--google"
    :disabled="loading"
    @click="onClick"
  >
    <span class="btn--google__circle">
      <svg width="14" height="14" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
        />
      </svg>
    </span>
    <span>Continuar con Google</span>
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
