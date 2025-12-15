<template>
  <Form
    v-slot="{ errors, meta }"
    :validation-schema="schema"
    @submit="handleSubmit"
  >
    <client-only>
      <div class="form form--profile">
        <!--Username -->
        <div class="form-group">
          <label class="form-label" for="username">Nombre de Usuario</label>
          <Field
            v-model="form.username"
            name="username"
            type="text"
            class="form-control"
            :readonly="!canChangeUsername"
          />
          <span v-if="!canChangeUsername" class="alert">
            Debes esperar {{ daysRemaining }} días para poder cambiar tu nombre
            de usuario nuevamente
          </span>
          <ErrorMessage v-else name="username" />
        </div>

        <button
          :disabled="
            !meta.valid || sending || !hasChanges || !canChangeUsername
          "
          :title="'Actualizar'"
          type="submit"
          class="btn btn--block btn--buy"
        >
          <span v-if="!sending">Actualizar</span>
          <span v-if="sending">Actualizando...</span>
        </button>
      </div>
    </client-only>
  </Form>
</template>

<script setup>
import { ref, computed } from "vue";
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";
const { Swal } = useSweetAlert2();
import { useMeStore } from "@/stores/me.store";
import { useStrapiUser } from "#imports";
import { useNuxtApp } from "#app";
import { useStrapiAuth } from "#imports";

const sending = ref(false);
const meStore = useMeStore();
const user = useStrapiUser();
const { $recaptcha } = useNuxtApp();
const { fetchUser } = useStrapiAuth();

const initialUsername = user.value?.username || "";
const form = ref({
  username: initialUsername,
});

// Computed property para verificar si hay cambios
const hasChanges = computed(() => {
  return form.value.username !== initialUsername;
});

// Computed properties para manejar el tiempo de espera
const canChangeUsername = computed(() => {
  if (!user.value?.last_username_change) return true;

  const lastChange = new Date(user.value.last_username_change);
  const now = new Date();
  const diffTime = now - lastChange;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 90;
});

const daysRemaining = computed(() => {
  if (!user.value?.last_username_change) return 0;

  const lastChange = new Date(user.value.last_username_change);
  const now = new Date();
  const diffTime = now - lastChange;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(90 - diffDays, 0);
});

const schema = yup.object({
  username: yup
    .string()
    .required("El nombre de usuario es requerido")
    .matches(
      /^[\w.]+$/,
      "Solo se permiten letras, números, puntos y guiones bajos",
    ),
});

const getErrorMessage = (error) => {
  const message =
    error?.error?.message ||
    "Hubo un error al actualizar el nombre de usuario. Por favor, inténtalo de nuevo.";

  if (message.includes("protected brand terms")) {
    return "No puedes usar términos de marca protegidos en tu nombre de usuario. Por favor, elige otro nombre.";
  }

  return message;
};

const handleSubmit = async (values) => {
  if (!canChangeUsername.value) {
    Swal.fire(
      "Error",
      `Debes esperar ${daysRemaining.value} días para poder cambiar tu nombre de usuario`,
      "error",
    );
    return;
  }

  // Confirmación antes de proceder
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    html: `
      <p>Vas a cambiar tu nombre de usuario a: <strong>${values.username}</strong></p>
      <p>Ten en cuenta que después de este cambio, deberás esperar 90 días para poder modificarlo nuevamente.</p>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, cambiar nombre",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
  });

  if (!result.isConfirmed) return;

  sending.value = true;

  try {
    // Execute reCAPTCHA v3
    const recaptchaToken = await $recaptcha.execute("submit");

    await meStore.saveUsername({
      ...values,
      recaptchaToken,
    });

    // Actualizar el usuario
    await fetchUser();

    Swal.fire({
      text: "Nombre de usuario actualizado correctamente",
      icon: "success",
      confirmButtonText: "Aceptar",
    });
  } catch (error) {
    Swal.fire("Error", getErrorMessage(error), "error");
  } finally {
    sending.value = false;
  }
};
</script>
