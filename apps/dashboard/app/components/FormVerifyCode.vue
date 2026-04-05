<template>
  <div class="form form--verify">
    <div class="form__group">
      <label class="form__label" for="code">Código de verificación</label>
      <input
        id="code"
        :value="code"
        type="text"
        inputmode="numeric"
        maxlength="6"
        autocomplete="one-time-code"
        class="form__control"
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

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";
import { useRouter } from "vue-router";
import { useLogger } from "@/composables/useLogger";
import type { User } from "@/types/user";
import { useAppStore } from "@/stores/app.store";

const { Swal } = useSweetAlert2();
const router = useRouter();
const { logInfo } = useLogger();
const client = useApiClient();

// Transient pendingToken set by FormLogin.vue
const pendingToken = useState<string>("pendingToken");

// Form state
const code = ref("");
const sending = ref(false);
const resending = ref(false);

// Code must be exactly 6 digits
const isCodeValid = computed(() => /^\d{6}$/.test(code.value));

// Only allow digit characters — block everything else at keydown level
const handleKeydown = (e: KeyboardEvent) => {
  // Allow: backspace, delete, tab, arrows, home, end, ctrl/cmd+a/c/v/x
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
  // Block anything that is not a digit
  if (!/^\d$/.test(e.key)) e.preventDefault();
};

// Strip non-digits on input (handles autocomplete and IME), auto-submit at 6
const handleInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const digits = input.value.replace(/\D/g, "").slice(0, 6);
  code.value = digits;
  // Keep cursor at end
  input.value = digits;
  if (digits.length === 6) handleVerify();
};

// Handle paste: strip non-digits, cap at 6, auto-submit
const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault();
  const pasted = (e.clipboardData?.getData("text") ?? "")
    .replace(/\D/g, "")
    .slice(0, 6);
  code.value = pasted;
  (e.target as HTMLInputElement).value = pasted;
  if (pasted.length === 6) handleVerify();
};

// 60-second resend countdown (starts on mount — code was just sent by FormLogin)
const resendCooldown = ref(60);
let timer: ReturnType<typeof setInterval> | null = null;

const startCountdown = () => {
  resendCooldown.value = 60;
  timer = setInterval(() => {
    resendCooldown.value--;
    if (resendCooldown.value <= 0) {
      clearInterval(timer!);
      timer = null;
    }
  }, 1000);
};

onMounted(() => {
  // Guard: if no pendingToken, user didn't come from the login form — redirect back
  if (!pendingToken.value) {
    router.replace("/auth/login");
    return;
  }
  startCountdown();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// Verify submitted code
const handleVerify = async () => {
  sending.value = true;
  try {
    const responseRaw = await client("/auth/verify-code", {
      method: "POST",
      body: { pendingToken: pendingToken.value, code: code.value.trim() },
    });
    const response = responseRaw as { jwt: string };

    // Store JWT via @nuxtjs/strapi v2 — sets cookie AND reactive user state
    // Clear the nuxt._cookies cache first — the module caches the cookie ref on init
    // and won't re-read document.cookie if it was externally cleared (e.g. logout in another tab)
    const nuxtApp = useNuxtApp();
    const strapiPublicConfig = useRuntimeConfig().public.strapi as Record<
      string,
      unknown
    >;
    const cookieName = strapiPublicConfig.cookieName as string;
    if (nuxtApp._cookies?.[cookieName]) {
      Reflect.deleteProperty(nuxtApp._cookies, cookieName);
    }
    const { setToken, fetchUser } = useSessionAuth();
    const { logout } = useLogout();
    setToken(response.jwt);
    await fetchUser();

    // Manager role check — same cast pattern as guard.global.ts
    const user = useSessionUser<User>();
    if (!user.value || user.value.role?.name?.toLowerCase() !== "manager") {
      await logout();
      Swal.fire(
        "Acceso denegado",
        "Solo los usuarios con rol de manager pueden acceder al dashboard.",
        "error",
      );
      return;
    }

    pendingToken.value = "";
    logInfo("User logged in successfully via 2-step verification.");
    const appStore = useAppStore();
    appStore.clearReferer();
    router.push("/");
  } catch (error) {
    const err = error as {
      data?: { error?: { message?: string } };
      error?: { message?: string };
    };
    const msg =
      err?.data?.error?.message ??
      err?.error?.message ??
      "El código es inválido o ha expirado.";
    Swal.fire("Error de verificación", msg, "error");
    router.push("/auth/login");
  } finally {
    sending.value = false;
  }
};

// Resend code — called by the parent page via ref
const handleResend = async () => {
  resending.value = true;
  try {
    await client("/auth/resend-code", {
      method: "POST",
      body: { pendingToken: pendingToken.value },
    });
    startCountdown();
  } catch (error) {
    const err = error as {
      data?: { error?: { message?: string } };
      error?: { message?: string };
    };
    const msg =
      err?.data?.error?.message ??
      err?.error?.message ??
      "No se pudo reenviar el código. Inténtalo de nuevo.";
    Swal.fire("Error", msg, "error");
  } finally {
    resending.value = false;
  }
};

// Expose to parent page (verify-code.vue uses ref to drive the resend link)
defineExpose({ handleResend, resendCooldown, resending });
</script>
