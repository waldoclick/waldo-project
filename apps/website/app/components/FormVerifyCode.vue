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

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app.store";
import { useMeStore } from "@/stores/me.store";
import { useLogger } from "@/composables/useLogger";

const { Swal } = useSweetAlert2();
const router = useRouter();
const { logInfo } = useLogger();
const apiClient = useApiClient();
const { login } = useAdAnalytics();

const pendingToken = useState("pendingToken");

const digits = ref(["", "", "", "", "", ""]);
const inputRefs = ref([]);
const sending = ref(false);
const resending = ref(false);

const code = computed(() => digits.value.join(""));
const isCodeValid = computed(() => /^\d{6}$/.test(code.value));

const setInputRef = (el, i) => {
  if (el instanceof HTMLInputElement) {
    inputRefs.value[i] = el;
  }
};

const handleDigitInput = (index, event) => {
  const input = event.target;
  const char = input.value.replace(/\D/g, "").slice(0, 1);
  digits.value[index] = char;
  input.value = char;
  if (char && index < 5) {
    inputRefs.value[index + 1]?.focus();
  }
  if (digits.value.every((d) => d !== "")) {
    handleVerify();
  }
};

const handleDigitKeydown = (index, event) => {
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
  const allowed = ["Delete", "Tab", "Home", "End"];
  if (allowed.includes(event.key)) return;
  if (
    (event.ctrlKey || event.metaKey) &&
    ["a", "c", "v", "x"].includes(event.key)
  )
    return;
  if (!/^\d$/.test(event.key)) event.preventDefault();
};

const handleDigitPaste = (event) => {
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
  nextTick(() => {
    inputRefs.value[0]?.focus();
  });
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

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

    const meStore = useMeStore();
    const isProfileComplete = await meStore.isProfileComplete();
    if (!isProfileComplete) {
      router.push("/cuenta/perfil/editar");
      return;
    }

    const appStore = useAppStore();
    appStore.closeLoginLightbox();
    const redirectTo = appStore.getReferer || "/anuncios";
    appStore.clearReferer();
    router.push(redirectTo);
  } catch (error) {
    const msg =
      error?.data?.error?.message ??
      error?.error?.message ??
      "El código es inválido o ha expirado.";
    const fatal = msg.includes("Maximum attempts") || msg.includes("expired");
    Swal.fire("Error de verificación", msg, "error");
    if (fatal) {
      router.push("/login");
    } else {
      digits.value = ["", "", "", "", "", ""];
      await nextTick();
      inputRefs.value[0]?.focus();
    }
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
