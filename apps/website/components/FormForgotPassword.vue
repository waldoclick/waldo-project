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

    <button
      :disabled="!meta.valid || loading"
      type="submit"
      class="btn btn--block btn--primary"
    >
      <span v-if="!loading">Enviar</span>
      <span v-if="loading">Enviando…</span>
    </button>
  </Form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
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
});

const form = ref({
  email: "",
});

const loading = ref(false);
const { forgotPassword } = useStrapiAuth();
const router = useRouter();
const { $recaptcha } = useNuxtApp();

const onSubmit = async (values: any) => {
  loading.value = true;

  try {
    // Execute reCAPTCHA v3
    const token = await $recaptcha.execute("submit");

    await forgotPassword({
      email: values.email,
      recaptchaToken: token,
    });

    Swal.fire(
      "Éxito",
      "Código de restablecimiento enviado con éxito.",
      "success"
    );
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
</script>
