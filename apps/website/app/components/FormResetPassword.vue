<template>
  <Form
    v-slot="{ errors, meta }"
    :validation-schema="schema"
    @submit="onSubmit"
  >
    <div class="form-group">
      <label class="form-label" for="email">Correo electrónico</label>
      <Field
        v-model="form.email"
        name="email"
        type="text"
        class="form-control"
        autocomplete="email"
      />
      <ErrorMessage name="email" />
    </div>

    <Field v-model="form.code" name="code" type="hidden" />

    <div class="form-group form-group--password">
      <label class="form-label" for="password">Nueva Contraseña</label>
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
      <ErrorMessage name="password" />
    </div>

    <button
      :disabled="!meta.valid || loading"
      type="submit"
      class="btn btn--block btn--primary"
    >
      <span v-if="!loading">Restablecer Contraseña</span>
      <span v-if="loading">Restableciendo…</span>
    </button>
  </Form>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
const { Swal } = useSweetAlert2();

// Define validation schema using yup
const schema = yup.object({
  email: yup
    .string()
    .email("Correo electrónico no válido")
    .required("Correo electrónico es requerido"),
  code: yup.string().required("Código de restablecimiento es requerido"),
  password: yup.string().required("Nueva contraseña es requerida"),
});

const route = useRoute();

// onMounted: UI-only — validates presence of reset token from URL query param; shows 404 if missing
onMounted(() => {
  if (!route.query.token) {
    showError({
      statusCode: 404,
      message: "Token no válido",
      statusMessage: "El enlace para restablecer la contraseña no es válido",
    });
  }
});

const form = ref({
  email: "",
  code: (route.query.token as string) || "",
  password: "",
});

const loading = ref(false);
const passwordType = ref("password");
const apiClient = useApiClient();
const router = useRouter();

const onSubmit = async (values: Record<string, unknown>) => {
  loading.value = true;

  try {
    await apiClient("/auth/reset-password", {
      method: "POST",
      body: {
        code: values.code as string,
        password: values.password as string,
        passwordConfirmation: values.password as string,
      },
    });

    Swal.fire("Éxito", "Contraseña restablecida con éxito.", "success");
    router.push("/");
  } catch {
    Swal.fire(
      "Error",
      "Hubo un error. Por favor, inténtalo de nuevo.",
      "error",
    );
  } finally {
    loading.value = false;
  }
};

const handleShowPassword = () => {
  passwordType.value = passwordType.value === "password" ? "text" : "password";
};
</script>
