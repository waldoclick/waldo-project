<template>
  <Form
    v-slot="{ errors, meta }"
    :validation-schema="schema"
    @submit="handleSubmit"
  >
    <div class="form-group form-group--password">
      <label class="form-label" for="current_password">Contraseña actual</label>
      <div class="form-group--password__field">
        <Field
          v-model="form.current_password"
          name="current_password"
          :type="passwordType"
          class="form-control"
          autocomplete="current-password"
        />
        <button
          class="form-group--password__show-password"
          type="button"
          :title="`Mostrar/ocultar contraseña`"
          @click="handleShowPassword"
        >
          <strong v-if="passwordType !== 'password'">Ocultar</strong>
          <strong v-else>Mostrar</strong>
        </button>
      </div>
      <ErrorMessage name="current_password" />
    </div>

    <div class="form-group form-group--password form-group--withgen">
      <div class="form-group--password__topbar">
        <label class="form-label" for="password">Nueva contraseña</label>
        <button
          type="button"
          class="form-group--password__generate"
          @click="handleGeneratePassword"
        >
          <IconSparkles :size="13" /> Generar segura
        </button>
      </div>
      <div class="form-group--password__field">
        <Field
          v-model="form.password"
          name="password"
          :type="passwordType"
          class="form-control"
          autocomplete="new-password"
        />
        <button
          class="form-group--password__show-password"
          type="button"
          :title="`Mostrar/ocultar contraseña`"
          @click="handleShowPassword"
        >
          <strong v-if="passwordType !== 'password'">Ocultar</strong>
          <strong v-else>Mostrar</strong>
        </button>
      </div>
      <ErrorMessage name="password" />
      <PasswordStrength :password="form.password" />
    </div>

    <div class="form-group form-group--password">
      <label class="form-label" for="password_confirmation"
        >Repetir nueva contraseña</label
      >
      <div class="form-group--password__field">
        <Field
          v-model="form.password_confirmation"
          name="password_confirmation"
          :type="passwordType"
          class="form-control"
          autocomplete="new-password"
        />
        <button
          class="form-group--password__show-password"
          type="button"
          :title="`Mostrar/ocultar contraseña`"
          @click="handleShowPassword"
        >
          <strong v-if="passwordType !== 'password'">Ocultar</strong>
          <strong v-else>Mostrar</strong>
        </button>
      </div>
      <ErrorMessage name="password_confirmation" />
    </div>

    <button
      :disabled="!meta.valid || loading"
      type="submit"
      class="btn btn--block btn--primary"
    >
      <span v-if="!loading">Cambiar contraseña</span>
      <span v-if="loading">Cambiando…</span>
    </button>
  </Form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Form, Field, ErrorMessage } from "vee-validate";
import { Sparkles as IconSparkles } from "lucide-vue-next";
import * as yup from "yup";
const { Swal } = useSweetAlert2();

const user = useSessionUser();
const apiClient = useApiClient();

// Define validation schema using yup
const schema = yup.object({
  current_password: yup.string().required("Contraseña actual es requerida"),
  password: yup
    .string()
    .required("Nueva contraseña es requerida")
    .min(8, "Mínimo 8 caracteres")
    .max(50, "Máximo 50 caracteres")
    .matches(/[A-Z]/, "Debe incluir al menos una mayúscula")
    .matches(/[a-z]/, "Debe incluir al menos una minúscula")
    .matches(/\d/, "Debe incluir al menos un número"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas deben coincidir")
    .required("Confirmación de nueva contraseña es requerida"),
});

const form = ref({
  current_password: "",
  password: "",
  password_confirmation: "",
});

const loading = ref(false);
const passwordType = ref("password");
const router = useRouter();

const handleSubmit = async (values: Record<string, unknown>) => {
  loading.value = true;

  try {
    await apiClient("auth/change-password", {
      method: "POST",
      body: {
        currentPassword: values.current_password as string,
        password: values.password as string,
        passwordConfirmation: values.password_confirmation as string,
        // recaptchaToken removed — useApiClient injects X-Recaptcha-Token header automatically
      },
    });

    Swal.fire("", "La contraseña se ha cambiado con éxito.", "success");
  } catch (error) {
    handleError(error);
  } finally {
    loading.value = false;
  }
};

const handleError = (_error: unknown) => {
  Swal.fire("Error", "Hubo un error. Por favor, inténtalo de nuevo.", "error");
};

const handleShowPassword = () => {
  passwordType.value = passwordType.value === "password" ? "text" : "password";
};

const handleGeneratePassword = () => {
  const pwd = generateSecurePassword();
  form.value.password = pwd;
  form.value.password_confirmation = pwd;
  passwordType.value = "text";
};
</script>
