<template>
  <div class="page">
    <div class="auth">
      <div class="auth__introduce">
        <IntroduceAuth :title="title" :subtitle="subtitle" :list="list" />
      </div>
      <div class="auth__form">
        <div class="auth__form__inner">
          <h1 class="auth__form__title title">Verificación en dos pasos</h1>
          <div class="auth__form__fields">
            <div class="form form--verify">
              <div class="form__group">
                <label class="form__label" for="code"
                  >Código de verificación</label
                >
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { Ref } from "vue";
import { useRouter } from "vue-router";
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import { useAppStore } from "@/stores/app.store";
import { useLogger } from "@/composables/useLogger";
import type { User } from "@/types/user";

definePageMeta({
  layout: "auth",
  // No guest middleware — JWT is not set yet at this point
  // Guard is handled in onMounted via pendingToken check
});

const { Swal } = useSweetAlert2();
const router = useRouter();
const appStore = useAppStore();
const { logInfo } = useLogger();

// IntroduceAuth panel content
const title = "Verifica tu identidad en waldo.click®";
const subtitle = "Hemos enviado un código de verificación a tu correo:";
const list = [
  "Ingresa el código de 6 dígitos que recibiste por correo.",
  "El código es válido por 5 minutos.",
  "Si no lo ves, revisa tu carpeta de spam.",
  "Puedes solicitar un nuevo código después de 60 segundos.",
];

// Transient pendingToken from FormLogin.vue
const pendingToken = useState<string>("pendingToken");

// Form state
const code = ref("");
const sending = ref(false);
const resending = ref(false);

// Validation: code must be exactly 6 digits
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
  // Guard: if no pendingToken, user didn't come from login form — redirect back
  if (!pendingToken.value) {
    router.replace("/auth/login");
    return;
  }
  startCountdown();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// Verify code submit
const handleVerify = async () => {
  sending.value = true;
  const client = useStrapiClient();
  try {
    const responseRaw = await client("/auth/verify-code", {
      method: "POST",
      body: { pendingToken: pendingToken.value, code: code.value },
    });
    const response = responseRaw as { jwt: string };

    // Store JWT via @nuxtjs/strapi v2 — sets cookie AND reactive user state
    // DO NOT use useCookie('strapi_jwt').value directly — bypasses reactive state
    // DO NOT call strapi.find('users/me') — fetchUser() already does this
    const { setToken, fetchUser, logout } = useStrapiAuth();
    setToken(response.jwt);
    await fetchUser();

    // Manager role check — use project's User type (same cast pattern as guard.global.ts)
    const user = useStrapiUser() as Ref<User | null>;
    if (!user.value || user.value.role?.name?.toLowerCase() !== "manager") {
      // Not a manager — full logout (clears cookie + reactive state)
      await logout();
      Swal.fire(
        "Acceso denegado",
        "Solo los usuarios con rol de manager pueden acceder al dashboard.",
        "error",
      );
      router.push("/auth/login");
      return;
    }

    // Clear pendingToken now that login is complete
    pendingToken.value = "";

    logInfo("User logged in successfully via 2-step verification.");
    appStore.clearReferer();
    router.push("/");
  } catch (error) {
    // error is unknown in strict TS — narrow before access (same pattern as FormLogin.vue)
    const err = error as {
      data?: { error?: { message?: string } };
      error?: { message?: string };
    };
    const msg =
      err?.data?.error?.message ??
      err?.error?.message ??
      "El código es inválido o ha expirado.";

    Swal.fire("Error de verificación", msg, "error");
    // On expired/exhausted code, send user back to login to start fresh
    router.push("/auth/login");
  } finally {
    sending.value = false;
  }
};

// Resend code
const handleResend = async () => {
  resending.value = true;
  const client = useStrapiClient();
  try {
    await client("/auth/resend-code", {
      method: "POST",
      body: { pendingToken: pendingToken.value },
    });
    startCountdown();
  } catch (error) {
    // error is unknown in strict TS — narrow before access
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
