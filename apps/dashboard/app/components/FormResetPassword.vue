<template>
  <Form
    v-slot="{ errors, meta }"
    :validation-schema="schema"
    @submit="onSubmit"
  >
    <div class="form__group">
      <label class="form__label" for="email">Correo electrónico</label>
      <Field
        v-model="form.email"
        name="email"
        type="text"
        class="form__control"
        autocomplete="email"
      />
      <ErrorMessage name="email" />
    </div>

    <Field v-model="form.code" name="code" type="hidden" />

    <div class="form__group form__group--password">
      <label class="form__label" for="password">Nueva Contraseña</label>
      <Field
        v-model="form.password"
        name="password"
        :type="passwordType"
        class="form__control"
        autocomplete="new-password"
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

onMounted(() => {
  if (!route.query.token) {
    showError({
      statusCode: 404,
      message: "Token no válido",
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
const client = useApiClient();
const router = useRouter();

const onSubmit = async (values: any) => {
  loading.value = true;

  try {
    // X-Recaptcha-Token is injected automatically by useApiClient
    await client("/auth/reset-password", {
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
