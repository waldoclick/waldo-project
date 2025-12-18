<template>
  <Form
    v-slot="{ errors, meta }"
    :validation-schema="schema"
    @submit="handleSubmit"
  >
    <div class="form-group">
      <label class="form-label" for="current_password">Contraseña actual</label>
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
      <ErrorMessage name="current_password" />
    </div>

    <div class="form-group form-group--password">
      <label class="form-label" for="password">Nueva contraseña</label>
      <Field
        v-model="form.password"
        name="password"
        :type="passwordType"
        class="form-control"
        autocomplete="new-password"
      />
      <ErrorMessage name="password" />
    </div>

    <div class="form-group form-group--password">
      <label class="form-label" for="password_confirmation"
        >Repetir nueva contraseña</label
      >
      <Field
        v-model="form.password_confirmation"
        name="password_confirmation"
        :type="passwordType"
        class="form-control"
        autocomplete="new-password"
      />
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
import * as yup from "yup";
const { Swal } = useSweetAlert2();
import { useNuxtApp } from "#app";

const user = useStrapiUser();
const { changePassword } = useStrapiAuth();
const { $recaptcha } = useNuxtApp();

// Define validation schema using yup
const schema = yup.object({
  current_password: yup.string().required("Contraseña actual es requerida"),
  password: yup.string().required("Nueva contraseña es requerida"),
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
const { login } = useStrapiAuth();

const handleSubmit = async (values: any) => {
  loading.value = true;

  try {
    // Execute reCAPTCHA v3
    const token = await $recaptcha.execute("submit");

    const data = {
      currentPassword: values.current_password,
      password: values.password,
      passwordConfirmation: values.password_confirmation,
      recaptchaToken: token,
    };

    await changePassword(data);

    Swal.fire("", "La contraseña se ha cambiado con éxito.", "success");
  } catch (error) {
    handleError(error);
  } finally {
    loading.value = false;
  }
};

const handleError = (error: any) => {
  Swal.fire("Error", "Hubo un error. Por favor, inténtalo de nuevo.", "error");
};

const handleShowPassword = () => {
  passwordType.value = passwordType.value === "password" ? "text" : "password";
};
</script>
