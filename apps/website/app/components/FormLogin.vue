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
import { useRouter } from "vue-router";
import { useNuxtApp } from "#app";

const sending = ref(false);
const client = useStrapiClient();
const pendingToken = useState("pendingToken", () => "");
const router = useRouter();
const { $recaptcha } = useNuxtApp();

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
    const token = await $recaptcha.execute("submit");

    // Backend returns { pendingToken, email } — do NOT use useStrapiAuth().login()
    const response = await client("/auth/local", {
      method: "POST",
      body: {
        identifier: values.email,
        password: values.password,
        recaptchaToken: token,
      },
    });

    pendingToken.value = response.pendingToken;
    router.push("/login/verificar");
  } catch (error) {
    let swalMessage = "Hubo un error. Por favor, inténtalo de nuevo.";
    const errorMessage = error?.error?.message;

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
