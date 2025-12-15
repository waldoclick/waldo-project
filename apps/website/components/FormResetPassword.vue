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

    <div class="form-group">
      <label class="form-label" for="code">Código de restablecimiento</label>
      <Field
        v-model="form.code"
        name="code"
        type="hidden"
        class="form-control"
        readonly
      />
      <ErrorMessage name="code" />
    </div>

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
import { useNuxtApp } from "#app";

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
const { $recaptcha } = useNuxtApp();

onMounted(() => {
  if (!route.query.token) {
    showError({
      statusCode: 404,
      message: "Token no válido",
      description: "El enlace para restablecer la contraseña no es válido",
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
const { resetPassword } = useStrapiAuth();
const router = useRouter();

const onSubmit = async (values: any) => {
  loading.value = true;

  try {
    // Execute reCAPTCHA v3
    const token = await $recaptcha.execute("submit");

    await resetPassword({
      code: values.code,
      password: values.password,
      passwordConfirmation: values.password,
      recaptchaToken: token,
    });

    Swal.fire("Éxito", "Contraseña restablecida con éxito.", "success");
    router.push("/");
  } catch {
    Swal.fire(
      "Error",
      "Hubo un error. Por favor, inténtalo de nuevo.",
      "error"
    );
  } finally {
    loading.value = false;
  }
};

const handleShowPassword = () => {
  passwordType.value = passwordType.value === "password" ? "text" : "password";
};
</script>
