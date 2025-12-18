<template>
  <Form
    v-slot="{ errors, meta }"
    :validation-schema="schema"
    @submit="handleSubmit"
  >
    <div class="form form--login">
      <div>
        <!-- Username -->
        <div class="form-group">
          <label class="form-label" for="username">Usuario</label>
          <Field
            name="username"
            type="text"
            class="form-control"
            autocomplete="username"
            placeholder="Ingresa tu usuario de desarrollo"
          />
          <ErrorMessage name="username" />
        </div>

        <!-- Password -->
        <div class="form-group form-group--password">
          <label class="form-label" for="password">Contraseña</label>
          <Field
            name="password"
            :type="passwordType"
            class="form-control"
            autocomplete="current-password"
            placeholder="Ingresa tu contraseña de desarrollo"
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

<script setup>
import { ref } from "vue";
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";
const { Swal } = useSweetAlert2();
// Removed useRouter import - using navigateTo from Nuxt instead

const sending = ref(false);

// La cookie se establece desde el servidor, no necesitamos crearla aquí

const schema = yup.object({
  username: yup.string().required("Usuario es requerido"),
  password: yup.string().required("Contraseña es requerida"),
});

const passwordType = ref("password");

const handleShowPassword = () => {
  passwordType.value = passwordType.value === "password" ? "text" : "password";
};

const handleSubmit = async (values) => {
  console.log("🚀 Formulario enviado con valores:", values);
  sending.value = true;

  try {
    // Usar fetch directamente para asegurar que funcione
    console.log("📡 Enviando petición a /api/dev-login");
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
    console.log("✅ Respuesta del servidor:", data);

    if (data.success) {
      // La cookie ya fue establecida por el servidor
      window.location.href = "/";
    } else {
      console.log("❌ Autenticación fallida:", data);
    }
  } catch (error) {
    let swalMessage =
      "No se pudo autenticar. Verifica tus credenciales de desarrollo.";

    if (error.message.includes("401")) {
      swalMessage = "Usuario o contraseña de desarrollo incorrectos.";
    } else if (error.message.includes("400")) {
      swalMessage = "Por favor, completa todos los campos requeridos.";
    }

    Swal.fire("Acceso Denegado", swalMessage, "error");
  } finally {
    sending.value = false;
  }
};
</script>
