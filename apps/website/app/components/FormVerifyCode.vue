<template>
  <div class="form form--verify">
    <div class="form-group">
      <label class="form-label" for="code">Código de verificación</label>
      <input
        id="code"
        :value="code"
        type="text"
        inputmode="numeric"
        maxlength="6"
        autocomplete="one-time-code"
        class="form-control"
        placeholder="000000"
        @input="handleInput"
        @keydown="handleKeydown"
        @paste="handlePaste"
      />
    </div>

    <button
      :disabled="!isCodeValid || sending"
      type="button"
      class="btn btn--block btn--primary"
      @click="handleVerify"
    >
      <span v-if="!sending">Verificar</span>
      <span v-if="sending">Verificando...</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app.store";
import { useMeStore } from "@/stores/me.store";
import { useLogger } from "@/composables/useLogger";

const { Swal } = useSweetAlert2();
const router = useRouter();
const appStore = useAppStore();
const meStore = useMeStore();
const { logInfo } = useLogger();
const apiClient = useApiClient();
const { login } = useAdAnalytics();

const pendingToken = useState("pendingToken");

const code = ref("");
const sending = ref(false);
const resending = ref(false);

const isCodeValid = computed(() => /^\d{6}$/.test(code.value));

const resendCooldown = ref(60);
let timer = null;

const startCountdown = () => {
  resendCooldown.value = 60;
  timer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(timer);
      timer = null;
    }
  }, 1000);
};

onMounted(() => {
  if (!pendingToken.value) {
    router.replace("/login");
    return;
  }
  startCountdown();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// Only allow digits at keydown
const handleKeydown = (e) => {
  const allowed = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
  ];
  if (allowed.includes(e.key)) return;
  if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key)) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
};

// Strip non-digits on input, auto-submit at 6
const handleInput = (e) => {
  const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
  code.value = digits;
  e.target.value = digits;
  if (digits.length === 6) handleVerify();
};

// Handle paste: strip non-digits, auto-submit at 6
const handlePaste = (e) => {
  e.preventDefault();
  const pasted = (e.clipboardData?.getData("text") ?? "")
    .replace(/\D/g, "")
    .slice(0, 6);
  code.value = pasted;
  e.target.value = pasted;
  if (pasted.length === 6) handleVerify();
};

const handleVerify = async () => {
  sending.value = true;
  try {
    const responseRaw = await apiClient("/auth/verify-code", {
      method: "POST",
      body: { pendingToken: pendingToken.value, code: code.value.trim() },
    });

    const { setToken, fetchUser } = useStrapiAuth();
    setToken(responseRaw.jwt);
    await fetchUser();

    pendingToken.value = "";
    logInfo("User logged in successfully via 2-step verification.");
    login("email");

    // Website post-login flow: profile check → referer → /anuncios
    const isProfileComplete = await meStore.isProfileComplete();
    if (!isProfileComplete) {
      router.push("/cuenta/perfil/editar");
      return;
    }

    appStore.closeLoginLightbox();
    const redirectTo = appStore.getReferer || "/anuncios";
    appStore.clearReferer();
    router.push(redirectTo);
  } catch (error) {
    const msg =
      error?.data?.error?.message ??
      error?.error?.message ??
      "El código es inválido o ha expirado.";
    Swal.fire("Error de verificación", msg, "error");
    router.push("/login");
  } finally {
    sending.value = false;
  }
};

const handleResend = async () => {
  resending.value = true;
  try {
    await apiClient("/auth/resend-code", {
      method: "POST",
      body: { pendingToken: pendingToken.value },
    });
    startCountdown();
  } catch (error) {
    const msg =
      error?.data?.error?.message ??
      error?.error?.message ??
      "No se pudo reenviar el código. Inténtalo de nuevo.";
    Swal.fire("Error", msg, "error");
  } finally {
    resending.value = false;
  }
};

defineExpose({ handleResend, resendCooldown, resending });
</script>
