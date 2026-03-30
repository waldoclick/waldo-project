<template>
  <Form v-slot="{ meta }" :validation-schema="schema" @submit="handleSubmit">
    <div class="form form--profile-edit">
      <div class="form__grid">
        <div class="form__group">
          <label class="form__label" for="firstname">Nombre</label>
          <Field
            v-model="form.firstname"
            name="firstname"
            type="text"
            class="form__control"
            autocomplete="given-name"
          />
          <ErrorMessage name="firstname" />
        </div>

        <div class="form__group">
          <label class="form__label" for="lastname">Apellido</label>
          <Field
            v-model="form.lastname"
            name="lastname"
            type="text"
            class="form__control"
            autocomplete="family-name"
          />
          <ErrorMessage name="lastname" />
        </div>
      </div>

      <div class="form__group">
        <label class="form__label" for="email">Correo electrónico</label>
        <Field
          v-model="form.email"
          name="email"
          type="email"
          class="form__control"
          autocomplete="email"
        />
        <ErrorMessage name="email" />
      </div>

      <div class="form__group">
        <label class="form__label" for="username">Nombre de usuario</label>
        <Field
          v-model="form.username"
          name="username"
          type="text"
          class="form__control"
          autocomplete="username"
        />
        <ErrorMessage name="username" />
      </div>

      <div class="form__send">
        <button
          :disabled="sending || !meta.valid"
          type="submit"
          class="btn btn--primary"
        >
          <span v-if="!sending">Guardar cambios</span>
          <span v-else>Guardando...</span>
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
const client = useApiClient();
const { fetchUser } = useSessionAuth();
const user = useSessionUser<User>();

const sending = ref(false);

const schema = yup.object({
  firstname: yup.string().required("Nombre es requerido"),
  lastname: yup.string().required("Apellido es requerido"),
  email: yup
    .string()
    .email("Correo electrónico no válido")
    .required("Correo electrónico es requerido"),
  username: yup.string().required("Nombre de usuario es requerido"),
});

const form = ref({
  firstname: user.value?.firstname ?? "",
  lastname: user.value?.lastname ?? "",
  email: user.value?.email ?? "",
  username: user.value?.username ?? "",
});

const handleSubmit = async (values: any) => {
  sending.value = true;
  try {
    await client(`/users/${user.value!.id}`, {
      method: "PUT",
      body: {
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        username: values.username,
      },
    });
    await fetchUser();
    Swal.fire("Éxito", "Perfil actualizado con éxito.", "success");
  } catch {
    Swal.fire("Error", "Hubo un error al guardar el perfil.", "error");
  } finally {
    sending.value = false;
  }
};
</script>
