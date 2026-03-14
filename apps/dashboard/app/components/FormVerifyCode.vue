<template>
  <div class="form form--verify">
    <div class="form__group">
      <label class="form__label" for="code">Código de verificación</label>
      <input
        id="code"
        v-model="code"
        type="text"
        inputmode="numeric"
        maxlength="6"
        autocomplete="one-time-code"
        class="form__control"
        placeholder="000000"
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

    <div class="form--verify__resend">
      <button
        :disabled="resendDisabled || resending"
        type="button"
        class="btn btn--block btn--secondary"
        @click="handleResend"
      >
        <span v-if="resendCooldown > 0"
          >Reenviar código ({{ resendCooldown }}s)</span
        >
        <span v-else-if="resending">Reenviando...</span>
        <span v-else>Reenviar código</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app.store";
import { useLogger } from "@/composables/useLogger";
import type { User } from "@/types/user";

const { Swal } = useSweetAlert2();
const router = useRouter();
const appStore = useAppStore();
const { logInfo } = useLogger();
const client = useStrapiClient();

// Transient pendingToken set by FormLogin.vue
const pendingToken = useState<string>("pendingToken");

// Form state
const code = ref("");
const sending = ref(false);
const resending = ref(false);

// Code must be exactly 6 digits
const isCodeValid = computed(() => /^\d{6}$/.test(code.value));

// 60-second resend countdown (starts on mount — code was just sent by FormLogin)
const resendCooldown = ref(60);
const resendDisabled = computed(() => resendCooldown.value > 0);
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
    const { setToken, fetchUser, logout } = useStrapiAuth();
    setToken(response.jwt);
    await fetchUser();

    // Manager role check — same cast pattern as guard.global.ts
    const user = useStrapiUser() as Ref<User | null>;
    if (!user.value || user.value.role?.name?.toLowerCase() !== "manager") {
      await logout();
      Swal.fire(
        "Acceso denegado",
        "Solo los usuarios con rol de manager pueden acceder al dashboard.",
        "error",
      );
      router.push("/auth/login");
      return;
    }

    pendingToken.value = "";
    logInfo("User logged in successfully via 2-step verification.");
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

// Resend code
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
</script>
