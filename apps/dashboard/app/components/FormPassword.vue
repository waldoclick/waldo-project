<template>
  <Form v-slot="{ meta }" :validation-schema="schema" @submit="handleSubmit">
    <div class="form form--password">
      <div class="form__group form__group--password">
        <label class="form__label" for="currentPassword"
          >Contraseña actual</label
        >
        <Field
          v-model="form.currentPassword"
          name="currentPassword"
          :type="currentPasswordType"
          class="form__control"
          autocomplete="current-password"
        />
        <button
          class="form__group--password__show-password"
          type="button"
          title="Mostrar/ocultar contraseña"
          @click="toggleCurrent"
        >
          <strong v-if="currentPasswordType !== 'password'">Ocultar</strong>
          <strong v-else>Mostrar</strong>
        </button>
        <ErrorMessage name="currentPassword" />
      </div>

      <div class="form__group form__group--password">
        <label class="form__label" for="newPassword">Nueva contraseña</label>
        <Field
          v-model="form.newPassword"
          name="newPassword"
          :type="newPasswordType"
          class="form__control"
          autocomplete="new-password"
        />
        <button
          class="form__group--password__show-password"
          type="button"
          title="Mostrar/ocultar contraseña"
          @click="toggleNew"
        >
          <strong v-if="newPasswordType !== 'password'">Ocultar</strong>
          <strong v-else>Mostrar</strong>
        </button>
        <ErrorMessage name="newPassword" />
      </div>

      <div class="form__group form__group--password">
        <label class="form__label" for="confirmPassword"
          >Repetir contraseña</label
        >
        <Field
          v-model="form.confirmPassword"
          name="confirmPassword"
          :type="confirmPasswordType"
          class="form__control"
          autocomplete="new-password"
        />
        <button
          class="form__group--password__show-password"
          type="button"
          title="Mostrar/ocultar contraseña"
          @click="toggleConfirm"
        >
          <strong v-if="confirmPasswordType !== 'password'">Ocultar</strong>
          <strong v-else>Mostrar</strong>
        </button>
        <ErrorMessage name="confirmPassword" />
      </div>

      <div class="form__send">
        <button
          :disabled="sending || !meta.valid"
          type="submit"
          class="btn btn--primary"
        >
          <span v-if="!sending">Cambiar contraseña</span>
          <span v-else>Cambiando...</span>
        </button>
      </div>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import type { User } from "@/types/user";

const { Swal } = useSweetAlert2();
const strapi = useStrapi();
const user = useStrapiUser() as Ref<User | null>;

const sending = ref(false);
const currentPasswordType = ref("password");
const newPasswordType = ref("password");
const confirmPasswordType = ref("password");

const toggleCurrent = () => {
  currentPasswordType.value =
    currentPasswordType.value === "password" ? "text" : "password";
};

const toggleNew = () => {
  newPasswordType.value =
    newPasswordType.value === "password" ? "text" : "password";
};

const toggleConfirm = () => {
  confirmPasswordType.value =
    confirmPasswordType.value === "password" ? "text" : "password";
};

const schema = yup.object({
  currentPassword: yup.string().required("Contraseña actual es requerida"),
  newPassword: yup
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("Nueva contraseña es requerida"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Las contraseñas no coinciden")
    .required("Debes repetir la nueva contraseña"),
});

const form = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const handleSubmit = async (values: any) => {
  sending.value = true;
  try {
    await strapi.update("users", user.value!.id, {
      password: values.newPassword,
      currentPassword: values.currentPassword,
    } as unknown as Parameters<typeof strapi.update>[2]);
    Swal.fire("Éxito", "Contraseña cambiada con éxito.", "success");
    form.value = { currentPassword: "", newPassword: "", confirmPassword: "" };
  } catch {
    Swal.fire(
      "Error",
      "Hubo un error al cambiar la contraseña. Verifica tu contraseña actual.",
      "error",
    );
  } finally {
    sending.value = false;
  }
};
</script>
