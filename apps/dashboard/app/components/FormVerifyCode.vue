<template>
  <div class="form form--verify">
    <label class="form--verify__label">Código de verificación</label>
    <div class="form--verify__digits">
      <input
        v-for="(_, i) in digits"
        :key="i"
        :ref="(el) => setInputRef(el, i)"
        :value="digits[i]"
        type="text"
        inputmode="numeric"
        maxlength="1"
        :autocomplete="i === 0 ? 'one-time-code' : 'off'"
        class="form--verify__digits__input"
        @input="handleDigitInput(i, $event)"
        @keydown="handleDigitKeydown(i, $event)"
        @paste="handleDigitPaste"
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
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
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
const digits = ref<string[]>(["", "", "", "", "", ""]);
const inputRefs = ref<HTMLInputElement[]>([]);
const sending = ref(false);
const resending = ref(false);

// Assembled 6-digit string — feeds into isCodeValid and handleVerify unchanged
const code = computed(() => digits.value.join(""));

// Code must be exactly 6 digits
const isCodeValid = computed(() => /^\d{6}$/.test(code.value));

// Track input element refs by index
const setInputRef = (el: unknown, i: number) => {
  if (el instanceof HTMLInputElement) {
    inputRefs.value[i] = el;
  }
};

const handleDigitInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  const raw = input.value.replace(/\D/g, "");
  const char = raw.slice(0, 1);
  digits.value[index] = char;
  // Keep DOM in sync with single-char value
  input.value = char;
  if (char && index < 5) {
    inputRefs.value[index + 1]?.focus();
  }
  if (digits.value.every((d) => d !== "")) {
    handleVerify();
  }
};

const handleDigitKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === "Backspace") {
    if (digits.value[index] === "" && index > 0) {
      inputRefs.value[index - 1]?.focus();
    }
    return;
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    if (index > 0) inputRefs.value[index - 1]?.focus();
    return;
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    if (index < 5) inputRefs.value[index + 1]?.focus();
    return;
  }
  // Allow: delete, tab, home, end, ctrl/cmd+a/c/v/x
  const allowed = ["Delete", "Tab", "Home", "End"];
  if (allowed.includes(event.key)) return;
  if (
    (event.ctrlKey || event.metaKey) &&
    ["a", "c", "v", "x"].includes(event.key)
  )
    return;
  // Block non-digit keys
  if (!/^\d$/.test(event.key)) event.preventDefault();
};

const handleDigitPaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pasted = (event.clipboardData?.getData("text") ?? "")
    .replace(/\D/g, "")
    .slice(0, 6);
  for (let i = 0; i < 6; i++) {
    digits.value[i] = pasted[i] ?? "";
  }
  const lastFilledIndex = Math.min(pasted.length, 5);
  inputRefs.value[lastFilledIndex]?.focus();
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
  nextTick(() => {
    inputRefs.value[0]?.focus();
  });
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
    const fatal = msg.includes("Maximum attempts") || msg.includes("expired");
    Swal.fire("Error de verificación", msg, "error");
    if (fatal) {
      router.push("/auth/login");
    } else {
      digits.value = ["", "", "", "", "", ""];
      await nextTick();
      inputRefs.value[0]?.focus();
    }
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
