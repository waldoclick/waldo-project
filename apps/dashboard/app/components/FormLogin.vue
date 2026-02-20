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
      </div>
    </div>
  </Form>
</template>

<script setup>
import { ref } from "vue";
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";
const { Swal } = useSweetAlert2();
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app.store";
import { useNuxtApp } from "#app";
import { useLogger } from "@/composables/useLogger";

const sending = ref(false);
const { login } = useStrapiAuth();
const router = useRouter();
const appStore = useAppStore();
const { $recaptcha } = useNuxtApp();
const { logInfo } = useLogger();
const config = useRuntimeConfig();
const strapi = useStrapi();

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

const handleSubmit = async (values) => {
  sending.value = true;

  try {
    // Execute reCAPTCHA v3
    const token = await $recaptcha.execute("submit");

    // Agregar el token al objeto de login
    await login({
      identifier: values.email,
      password: values.password,
      recaptchaToken: token,
    });

    // Obtener el usuario usando /users/me que ahora incluye role y commune
    const user = await strapi.find("users/me", {
      populate: {
        role: true,
        commune: {
          populate: "region",
        },
      },
    });

    // Verificar que el usuario tenga el role "manager" por type
    if (!user || user.role?.type !== "manager") {
      // Si no es manager, cerrar sesión y mostrar error
      const { logout } = useStrapiAuth();
      await logout();

      Swal.fire(
        "Acceso denegado",
        "Solo los usuarios con rol de manager pueden acceder al dashboard.",
        "error",
      );
      return;
    }

    // Log successful login
    logInfo(`User '${values.email}' logged in successfully.`);

    // Limpiar el referer si existe
    appStore.clearReferer();

    // Redirigir siempre al home después del login
    router.push("/");
  } catch (error) {
    let swalMessage = "Hubo un error. Por favor, inténtalo de nuevo.";
    const errorMessage = error.error?.message;

    if (errorMessage === "Your account email is not confirmed") {
      swalMessage =
        "Tu cuenta no ha sido confirmada. Por favor, revisa tu correo y sigue las instrucciones para confirmar tu cuenta.";
    } else if (errorMessage === "Invalid identifier or password") {
      swalMessage =
        "El correo electrónico o la contraseña son incorrectos. Por favor, verifica tus credenciales.";
    }

    Swal.fire("Error", swalMessage, "error");
  } finally {
    sending.value = false;
  }
};
</script>
