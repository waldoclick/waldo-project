<template>
  <Form
    ref="formRef"
    v-slot="{ errors, meta }"
    :validation-schema="schema"
    @submit="handleSubmit"
  >
    <div v-if="step === 1" class="step step--1">
      <!-- Is Company -->
      <div class="form-group">
        <label class="form-label" for="is_company">Tipo</label>
        <Field
          v-model="form.is_company"
          as="select"
          name="is_company"
          class="form-control"
        >
          <option :value="false">Persona Natural</option>
          <option :value="true">Empresa</option>
        </Field>
        <ErrorMessage name="is_company" />
      </div>

      <div class="form-group">
        <label class="form-label" for="firstname">
          {{ form.is_company ? "Razón Social" : "Nombres" }}
        </label>
        <Field
          v-model="form.firstname"
          name="firstname"
          type="text"
          class="form-control"
          autocomplete="given-name"
        />
        <ErrorMessage name="firstname" />
      </div>

      <div class="form-group">
        <label class="form-label" for="lastname">
          {{ form.is_company ? "Giro" : "Apellidos" }}
        </label>
        <Field
          v-model="form.lastname"
          name="lastname"
          type="text"
          class="form-control"
          autocomplete="additional-name"
        />
        <ErrorMessage name="lastname" />
      </div>

      <div class="form-group">
        <label class="form-label" for="rut">Rut</label>
        <Field
          v-model="form.rut"
          name="rut"
          type="text"
          class="form-control"
          autocomplete="id"
        />
        <ErrorMessage name="rut" />
      </div>
    </div>

    <div v-if="step === 2" class="step step--2">
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

      <div class="form-group">
        <label class="form-label" for="confirm_password"
          >Repetir contraseña</label
        >
        <Field
          v-model="form.confirm_password"
          name="confirm_password"
          :type="passwordType"
          class="form-control"
          autocomplete="new-password"
        />
        <ErrorMessage name="confirm_password" />
      </div>
    </div>

    <div class="form__send">
      <button
        v-if="step === 2"
        type="button"
        class="btn btn--block btn--secondary"
        @click="step = 1"
      >
        <span>Volver</span>
      </button>

      <button
        :disabled="!meta.valid || loading"
        type="submit"
        class="btn btn--block btn--primary"
      >
        <span v-if="step === 1">Siguiente</span>
        <span v-if="step === 2 && !loading">Registrate</span>
        <span v-if="step === 2 && loading">Registrando…</span>
      </button>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
const { Swal } = useSweetAlert2();
import { useRouter, useRoute } from "vue-router";
import type { Form as VeeForm } from "vee-validate";
import type { FormRegister } from "@/types/form-register";
import { useNuxtApp } from "#app";
import { useRut } from "@/composables/useRut";

const { register } = useStrapiAuth();
const router = useRouter();
const { $recaptcha } = useNuxtApp();
// const route = useRoute()
const formRef = ref<InstanceType<typeof VeeForm> | null>(null);

const form = ref<FormRegister>({
  is_company: false,
  firstname: "",
  lastname: "",
  email: "",
  rut: "",
  password: "",
  username: "",
});

const step = ref(1);
const loading = ref(false);
const passwordType = ref("password");

const { formatRut, validateRut } = useRut();

// Define el esquema de validación dinámicamente según el paso actual
const getSchema = () => {
  return step.value === 1
    ? yup.object({
        is_company: yup.boolean().required("Tipo es requerido"),
        firstname: yup
          .string()
          .required(() =>
            form.value.is_company
              ? "La Razón Social es requerida"
              : "El Nombre es requerido"
          )
          .matches(
            /^[\d\s.A-Za-zÁÉÍÑÓÚáéíñóú]+$/,
            "Solo se permiten letras, números, espacios, puntos"
          ),
        lastname: yup
          .string()
          .required(() =>
            form.value.is_company
              ? "El Giro es requerida"
              : "El Appelido es requerido"
          )
          .matches(
            /^[\d\s.A-Za-zÁÉÍÑÓÚáéíñóú]+$/,
            "Solo se permiten letras, números, espacios, puntos"
          ),
        rut: yup
          .string()
          .required("RUT es requerido")
          .test("is-valid-rut", "RUT no es válido", (value) =>
            validateRut(value || "")
          ),
      })
    : yup.object({
        email: yup
          .string()
          .required("Correo electrónico es requerido")
          .email("Correo electrónico no válido"),
        password: yup
          .string()
          .required("Contraseña es requerida")
          .min(6, "Mínimo 6 caracteres")
          .max(20, "Máximo 20 caracteres"),
        confirm_password: yup
          .string()
          .oneOf(
            [yup.ref("password"), undefined],
            "Las contraseñas deben coincidir"
          ),
      });
};

const schema = ref(getSchema());

watch(step, () => {
  schema.value = getSchema();
});

// Watch para formatear el RUT al ir ingresándolo
watch(
  () => form.value.rut,
  (newRut) => {
    form.value.rut = formatRut(newRut);
  }
);

const handleShowPassword = () => {
  passwordType.value = passwordType.value === "password" ? "text" : "password";
};

const handleSubmit = async () => {
  if (!formRef.value) {
    return Swal.fire("Error", "Formulario no encontrado.", "error");
  }
  const isValid = await formRef.value.validate();

  if (!isValid) {
    return Swal.fire(
      "Error",
      "Por favor, completa los campos requeridos.",
      "error"
    );
  }

  if (step.value === 1) {
    step.value = 2; // Cambia al siguiente paso
  } else {
    loading.value = true;
    try {
      // Execute reCAPTCHA v3
      const token = await $recaptcha.execute("submit");

      // Crear el campo username a partir del email
      const emailParts = form.value.email.split("@");
      form.value.username = emailParts[0]; // Asigna el nombre antes del @

      delete form.value.confirm_password;

      // Agregar el token al objeto de registro
      await register({
        ...form.value,
        recaptchaToken: token,
      });

      Swal.fire(
        "Cuenta creada",
        "Te enviado un correo para confirmar tu dirección de correo electrónico.",
        "success"
      );
      router.push("/login");
    } catch (error) {
      console.error(error);
      const message =
        (error as any).error?.message ||
        "Ocurrió un error durante el registro.";
      if (message === "Email or Username are already taken") {
        Swal.fire("Error", "El correo electrónico ya está en uso.", "error");
      } else {
        Swal.fire("Error", message, "error");
      }
    } finally {
      loading.value = false;
    }
  }
};
</script>
