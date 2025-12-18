<template>
  <Form
    v-slot="{ errors, meta }"
    :validation-schema="schema"
    @submit="handleSubmit"
  >
    <div class="form form--login">
      <div>
        <!-- Email -->
        <div class="form-group">
          <label class="form-label" for="email">Correo Electrónico</label>
          <Field
            v-model="form.email"
            name="email"
            type="email"
            class="form-control"
            autocomplete="email"
          />
          <ErrorMessage name="email" />
        </div>

        <!-- Password -->
        <div class="form-group form-group--password">
          <label class="form-label" for="password">Contraseña</label>
          <Field
            v-model="form.password"
            name="password"
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
import { useRouter, useRoute } from "vue-router";
import { useAppStore } from "@/stores/app.store";
import { useMeStore } from "@/stores/me.store";
import { useNuxtApp } from "#app";
import { useLogger } from "@/composables/useLogger";

const sending = ref(false);
const { login } = useStrapiAuth();
const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const meStore = useMeStore();
const { $recaptcha } = useNuxtApp();
const { logInfo } = useLogger();

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

    // Obtener el usuario después del login
    const user = useStrapiUser();

    // Verificar que el usuario tenga el role "manager"
    const userRole = user.value?.role;
    // El role puede venir como objeto { name: "Manager" } o como string "manager"
    // También verificar el campo type del usuario directamente
    const roleName =
      typeof userRole === "string"
        ? userRole.toLowerCase()
        : userRole?.name?.toLowerCase() ||
          userRole?.type?.toLowerCase() ||
          user.value?.type?.toLowerCase() ||
          null;

    if (roleName !== "manager") {
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

    // Verificar si el perfil del usuario está completo
    const isProfileComplete = await meStore.isProfileComplete();

    if (!isProfileComplete) {
      // Si el perfil no está completo, redirigir a la página de edición de perfil
      router.push("/cuenta/perfil/editar");
      return;
    }

    // Obtener el referer del store o usar /anuncios como fallback
    const redirectTo = appStore.getReferer || "/anuncios";
    // Limpiar el referer después de usarlo
    appStore.clearReferer();

    router.push(redirectTo);
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
