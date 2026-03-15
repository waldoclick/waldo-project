<template>
  <div class="page">
    <div class="auth">
      <div class="auth__introduce">
        <IntroduceAuth :title="title" :subtitle="subtitle" :list="list" />
      </div>
      <div class="auth__form">
        <div class="auth__form__inner">
          <NuxtLink
            to="/registro"
            class="auth__form__back"
            title="Volver al registro"
          >
            <img
              loading="lazy"
              decoding="async"
              :src="mobileMenuClose"
              alt="volver"
              title="volver"
            />
            <span>Volver</span>
          </NuxtLink>
          <h1 class="auth__form__title title">
            Confirma tu correo electrónico
          </h1>
          <div class="auth__form__description">
            Hemos enviado un enlace de confirmación a
            <strong>{{ registrationEmail }}</strong
            >. Revisa tu bandeja de entrada y haz clic en el enlace para activar
            tu cuenta.
          </div>
          <div class="auth__form__help">
            <p>
              ¿No recibiste el correo?
              <button
                :disabled="resendCooldown > 0 || resending"
                type="button"
                class="auth__form__help__link"
                @click="handleResend"
              >
                <span v-if="resendCooldown > 0"
                  >Reenviar en {{ resendCooldown }}s</span
                >
                <span v-else-if="resending">Reenviando...</span>
                <span v-else>Reenviar enlace</span>
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import IntroduceAuth from "@/components/IntroduceAuth.vue";
import mobileMenuClose from "/images/mobile-menu-close.svg";

definePageMeta({
  layout: "auth",
});

useSeoMeta({ robots: "noindex, nofollow" });

const title = "Crea tu cuenta en waldo.click®";
const subtitle = "Con tu cuenta en waldo.click® podrás:";
const list = [
  "Ver los datos de contacto de los anuncios.",
  "Publicar anuncios con nuestros planes disponibles.",
  "Disfrutar de hasta 3 anuncios gratis renovables.",
  "Recibir notificaciones de nuevos anuncios en tu correo periódicamente.",
];

const router = useRouter();
const registrationEmail = useState("registrationEmail", () => "");
const apiClient = useApiClient();
const { Swal } = useSweetAlert2();

const resendCooldown = ref(60);
const resending = ref(false);
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
  if (!registrationEmail.value) {
    router.replace("/registro");
    return;
  }
  startCountdown();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const handleResend = async () => {
  resending.value = true;
  try {
    await apiClient("/auth/send-email-confirmation", {
      method: "POST",
      body: { email: registrationEmail.value },
    });
    startCountdown();
  } catch (error) {
    console.error(error);
    Swal.fire(
      "Error",
      "No se pudo reenviar el correo. Inténtalo de nuevo.",
      "error",
    );
  } finally {
    resending.value = false;
  }
};
</script>
