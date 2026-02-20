<template>
  <Form
    v-slot="{ errors, meta }"
    :validation-schema="schema"
    @submit="handleSubmit"
  >
    <div class="form form--login">
      <div>
        <div class="form__group">
          <label class="form__label" for="username">Usuario</label>
          <Field
            name="username"
            type="text"
            class="form__control"
            autocomplete="username"
            placeholder="Ingresa tu usuario de desarrollo"
          />
          <ErrorMessage name="username" />
        </div>

        <div class="form__group form__group--password">
          <label class="form__label" for="password">Contraseña</label>
          <Field
            name="password"
            :type="passwordType"
            class="form__control"
            autocomplete="current-password"
            placeholder="Ingresa tu contraseña de desarrollo"
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
          :title="`Autenticarse`"
          type="submit"
          class="btn btn--block btn--primary"
        >
          <span v-if="!sending">Autenticarse</span>
          <span v-if="sending">Autenticando...</span>
        </button>
      </div>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";

const { Swal } = useSweetAlert2();
const sending = ref(false);

const schema = yup.object({
  username: yup.string().required("Usuario es requerido"),
  password: yup.string().required("Contraseña es requerida"),
});

const passwordType = ref("password");

const handleShowPassword = () => {
  passwordType.value = passwordType.value === "password" ? "text" : "password";
};

const handleSubmit = async (values: { username: string; password: string }) => {
  sending.value = true;

  try {
    const response = await fetch("/api/dev-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: values.username,
        password: values.password,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      window.location.href = "/";
    }
  } catch (error: unknown) {
    let swalMessage =
      "No se pudo autenticar. Verifica tus credenciales de desarrollo.";
    const message = error instanceof Error ? error.message : "";

    if (message.includes("401")) {
      swalMessage = "Usuario o contraseña de desarrollo incorrectos.";
    } else if (message.includes("400")) {
      swalMessage = "Por favor, completa todos los campos requeridos.";
    }

    Swal.fire("Acceso Denegado", swalMessage, "error");
  } finally {
    sending.value = false;
  }
};
</script>
