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
          maxlength="50"
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
          maxlength="50"
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
          maxlength="12"
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
          maxlength="254"
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
          maxlength="50"
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
          maxlength="50"
        />
        <ErrorMessage name="confirm_password" />
      </div>

      <div class="form-group">
        <div class="form-check">
          <Field
            id="accepted_age_confirmation"
            v-model="form.accepted_age_confirmation"
            name="accepted_age_confirmation"
            type="checkbox"
            class="form-check-input"
            :value="true"
            :unchecked-value="false"
          />
          <label class="form-check-label" for="accepted_age_confirmation">
            Confirmo que soy mayor de edad
          </label>
        </div>
        <ErrorMessage name="accepted_age_confirmation" />
      </div>

      <div class="form-group">
        <div class="form-check">
          <Field
            id="accepted_terms"
            v-model="form.accepted_terms"
            name="accepted_terms"
            type="checkbox"
            class="form-check-input"
            :value="true"
            :unchecked-value="false"
          />
          <label class="form-check-label" for="accepted_terms">
            Acepto las
            <NuxtLink to="/politicas-de-privacidad" target="_blank"
              >políticas de privacidad</NuxtLink
            >
          </label>
        </div>
        <ErrorMessage name="accepted_terms" />
      </div>

      <div class="form-group">
        <div class="form-check">
          <Field
            id="accepted_usage_terms"
            v-model="form.accepted_usage_terms"
            name="accepted_usage_terms"
            type="checkbox"
            class="form-check-input"
            :value="true"
            :unchecked-value="false"
          />
          <label class="form-check-label" for="accepted_usage_terms">
            Acepto las
            <NuxtLink to="/condiciones-de-uso" target="_blank"
              >condiciones de uso</NuxtLink
            >
          </label>
        </div>
        <ErrorMessage name="accepted_usage_terms" />
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
import { useRouter } from "vue-router";
import type { Form as VeeForm } from "vee-validate";
import type { FormRegister } from "@/types/form-register";
import { useRut } from "@/composables/useRut";
const { signUp } = useAdAnalytics();

const apiClient = useApiClient();
const registrationEmail = useState("registrationEmail", () => "");
const router = useRouter();
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
  accepted_age_confirmation: false,
  accepted_terms: false,
  accepted_usage_terms: false,
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
          .max(50, "Máximo 50 caracteres")
          .required(() =>
            form.value.is_company
              ? "La Razón Social es requerida"
              : "El Nombre es requerido",
          )
          .matches(
            /^[\d\s.A-Za-zÁÉÍÑÓÚáéíñóú]+$/,
            "Solo se permiten letras, números, espacios, puntos",
          ),
        lastname: yup
          .string()
          .max(50, "Máximo 50 caracteres")
          .required(() =>
            form.value.is_company
              ? "El Giro es requerida"
              : "El Apellido es requerido",
          )
          .matches(
            /^[\d\s.A-Za-zÁÉÍÑÓÚáéíñóú]+$/,
            "Solo se permiten letras, números, espacios, puntos",
          ),
        rut: yup
          .string()
          .max(12, "Máximo 12 caracteres")
          .required("El RUT es requerido")
          .test("is-valid-rut", "El RUT no es válido", (value) =>
            validateRut(value || ""),
          ),
      })
    : yup.object({
        email: yup
          .string()
          .max(254, "Máximo 254 caracteres")
          .required("Correo electrónico es requerido")
          .email("Correo electrónico no válido"),
        password: yup
          .string()
          .required("Contraseña es requerida")
          .min(6, "Mínimo 6 caracteres")
          .max(50, "Máximo 50 caracteres"),
        confirm_password: yup
          .string()
          .oneOf(
            [yup.ref("password"), undefined],
            "Las contraseñas deben coincidir",
          ),
        accepted_age_confirmation: yup
          .boolean()
          .oneOf([true], "Debes confirmar que eres mayor de edad")
          .required("Debes confirmar que eres mayor de edad"),
        accepted_terms: yup
          .boolean()
          .oneOf([true], "Debes aceptar las políticas de privacidad")
          .required("Debes aceptar las políticas de privacidad"),
        accepted_usage_terms: yup
          .boolean()
          .oneOf([true], "Debes aceptar las condiciones de uso")
          .required("Debes aceptar las condiciones de uso"),
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
  },
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
      "error",
    );
  }

  if (step.value === 1) {
    step.value = 2; // Cambia al siguiente paso
  } else {
    loading.value = true;
    try {
      // Crear el campo username a partir del email
      const emailParts = form.value.email.split("@");
      form.value.username = emailParts[0] ?? ""; // Asigna el nombre antes del @

      delete form.value.confirm_password;

      // Registrar usando useApiClient — auto-injects X-Recaptcha-Token header.
      // Handles email_confirmation active case (response without JWT).
      const response = (await apiClient("/auth/local/register", {
        method: "POST",
        body: {
          ...form.value,
        },
      })) as { jwt?: string; user?: { id: number } };

      if (response.jwt) {
        // Email confirmation deshabilitado: flujo normal → login
        signUp();
        Swal.fire(
          "Cuenta creada",
          "Tu cuenta ha sido creada exitosamente.",
          "success",
        );
        router.push("/login");
      } else {
        // Email confirmation habilitado: NO llamar setToken(undefined)
        registrationEmail.value = form.value.email;
        signUp();
        await Swal.fire({
          title: "¡Revisa tu correo!",
          text: `Te enviamos un enlace de confirmación a ${form.value.email}. Haz clic en el enlace para activar tu cuenta.`,
          icon: "success",
          confirmButtonText: "Entendido",
        });
        router.push("/registro/confirmar");
      }
    } catch (error) {
      console.error(error);
      const err = error as {
        error?: {
          message?: string;
          details?: { error?: { message?: string } };
        };
      };
      const strapiMessage =
        err.error?.details?.error?.message || err.error?.message || "";
      if (strapiMessage === "Email or Username are already taken") {
        Swal.fire("Error", "El correo electrónico ya está en uso.", "error");
      } else {
        Swal.fire(
          "Error",
          strapiMessage || "Ocurrió un error durante el registro.",
          "error",
        );
      }
    } finally {
      loading.value = false;
    }
  }
};
</script>
