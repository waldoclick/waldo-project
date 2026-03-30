<template>
  <Form
    v-slot="{ errors, meta }"
    :validation-schema="schema"
    @submit="handleSubmit"
  >
    <div class="form form--login">
      <div>
        <!-- Email -->
        <div class="form__group">
          <label class="form__label" for="email">Correo Electrónico</label>
          <Field
            v-model="form.email"
            name="email"
            type="email"
            class="form__control"
            autocomplete="email"
          />
          <ErrorMessage name="email" />
        </div>

        <!-- Password -->
        <div class="form__group form__group--password">
          <label class="form__label" for="password">Contraseña</label>
          <Field
            v-model="form.password"
            name="password"
            :type="passwordType"
            class="form__control"
            autocomplete="current-password"
          />
          <button
            class="form__group--password__show-password"
            type="button"
            :title="`Mostrar/ocultar contraseña`"
            @click="handleShowPassword"
          >
            <strong v-if="passwordType !== 'password'">Ocultar</strong>
            <strong v-else>Mostrar</strong>
          </button>
          <ErrorMessage name="password" />
        </div>

        <button
          :disabled="!meta.valid || sending"
          :title="`Iniciar Sesión`"
          type="submit"
          class="btn btn--block btn--primary"
        >
          <span v-if="!sending">Iniciar Sesión</span>
          <span v-if="sending">Iniciando sesión...</span>
        </button>

        <div v-if="showResendSection" class="form__resend-confirmation">
          <p>
            Tu cuenta (<strong>{{ unconfirmedEmail }}</strong
            >) no ha sido confirmada. Revisa tu bandeja de entrada o solicita un
            nuevo correo de confirmación.
          </p>
          <button
            type="button"
            :disabled="resending"
            class="btn btn--block btn--secondary"
            @click="handleResendConfirmation"
          >
            <span v-if="!resending">Reenviar confirmación</span>
            <span v-if="resending">Enviando...</span>
          </button>
        </div>
      </div>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";
const { Swal } = useSweetAlert2();
import { useRouter } from "vue-router";
const sending = ref(false);
const showResendSection = ref<boolean>(false);
const unconfirmedEmail = ref<string>("");
const resending = ref<boolean>(false);
const router = useRouter();
const client = useApiClient();
const pendingToken = useState<string>("pendingToken", () => "");

const schema = yup.object({
  email: yup
    .string()
    .email("Correo electrónico no válido")
    .required("Correo electrónico es requerido"),
  password: yup.string().required("Contraseña es requerida"),
});

const form = ref({
  email: "",
  password: "",
});

const passwordType = ref("password");

const handleShowPassword = () => {
  passwordType.value = passwordType.value === "password" ? "text" : "password";
};

const handleResendConfirmation = async () => {
  resending.value = true;
  try {
    await client("/auth/send-email-confirmation", {
      method: "POST",
      body: { email: unconfirmedEmail.value },
    });
    Swal.fire(
      "Correo enviado",
      "Hemos enviado un nuevo enlace de confirmación a tu correo.",
      "success",
    );
    showResendSection.value = false;
  } catch {
    Swal.fire(
      "Error",
      "No se pudo enviar el correo. Inténtalo de nuevo.",
      "error",
    );
  } finally {
    resending.value = false;
  }
};

const handleSubmit = async (values: Record<string, unknown>) => {
  // Check if there's an existing non-manager session cookie
  // Read document.cookie directly to always get the current browser state,
  // since useCookie() ref may be stale if the cookie was cleared in another tab
  const hasExistingSession =
    import.meta.client &&
    document.cookie.split(";").some((c) => c.trim().startsWith("waldo_jwt="));
  if (hasExistingSession) {
    const confirmed = await Swal.fire({
      title: "Sesión activa en el sitio público",
      text: "Tienes una sesión iniciada en el sitio público. ¿Deseas cerrarla e ingresar al dashboard?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cerrar sesión e ingresar",
      cancelButtonText: "Cancelar",
    });
    if (!confirmed.isConfirmed) return;
    const { logout: sessionLogout } = useSessionAuth();
    sessionLogout();
  }

  // Clear the nuxt._cookies cache so setToken() writes a fresh cookie
  // regardless of any stale ref left from a previous session in another tab
  const nuxtApp = useNuxtApp();
  const strapiPublicConfig = useRuntimeConfig().public.strapi as Record<
    string,
    unknown
  >;
  const cookieName = strapiPublicConfig.cookieName as string;
  if (nuxtApp._cookies?.[cookieName]) {
    delete nuxtApp._cookies[cookieName];
  }

  sending.value = true;

  try {
    // Call POST /api/auth/local directly — backend now returns { pendingToken, email }
    // (useSessionAuth().login() is NOT used because it expects a JWT, not a pendingToken)
    // X-Recaptcha-Token is injected automatically by useApiClient
    const response = await client("/auth/local", {
      method: "POST",
      body: {
        identifier: values.email as string,
        password: values.password as string,
      },
    });

    // Store pendingToken in transient SSR-safe state, then navigate to verify page
    pendingToken.value = (response as { pendingToken: string }).pendingToken;
    router.push("/auth/verify-code");
  } catch (error) {
    const errorMessage = (error as { error?: { message?: string } }).error
      ?.message;

    if (errorMessage === "Your account email is not confirmed") {
      unconfirmedEmail.value = values.email as string;
      showResendSection.value = true;
      return;
    }

    let swalMessage = "Hubo un error. Por favor, inténtalo de nuevo.";

    if (errorMessage === "Invalid identifier or password") {
      swalMessage =
        "El correo electrónico o la contraseña son incorrectos. Por favor, verifica tus credenciales.";
    }

    Swal.fire("Error", swalMessage, "error");
  } finally {
    sending.value = false;
  }
};
</script>
