<template>
  <form @submit.prevent="onSubmit">
    <!-- E-mail -->
    <div class="form-group">
      <label class="form-label" for="email">Correo electrónico</label>
      <Field
        v-model="form.email"
        name="email"
        as="input"
        type="email"
        placeholder="Ej: contacto@Waldo.click"
        class="form-control"
      />
      <ErrorMessage name="email" />
    </div>

    <!-- Nombre -->
    <div class="form-group">
      <label class="form-label" for="name">Nombre</label>
      <Field
        v-model="form.name"
        name="name"
        as="input"
        type="text"
        placeholder="Nombre completo"
        class="form-control"
        maxlength="30"
      />
      <ErrorMessage name="name" />
    </div>

    <!-- Empresa -->
    <div class="form-group">
      <label class="form-label" for="company">Empresa (opcional)</label>
      <Field
        v-model="form.company"
        name="company"
        as="input"
        type="text"
        placeholder="Nombre de la empresa"
        class="form-control"
        maxlength="50"
      />
      <ErrorMessage name="company" />
    </div>

    <!-- Teléfono -->
    <div class="form-group">
      <label class="form-label" for="phone">Teléfono (opcional)</label>
      <Field
        v-model="form.phone"
        name="phone"
        as="input"
        type="tel"
        placeholder="+56 9 XXXX XXXX"
        class="form-control"
        maxlength="20"
      />
      <ErrorMessage name="phone" />
    </div>

    <!-- Mensaje -->
    <div class="form-group contact-textarea">
      <label class="form-label" for="message">Mensaje</label>
      <Field
        ref="messageTextarea"
        v-model="form.message"
        name="message"
        as="textarea"
        class="form-control"
        placeholder="Escribe tu mensaje"
        @input="handleTextArea"
      />
      <ErrorMessage name="message" />
      <p class="form-msg">{{ remainingChars }} caracteres</p>
    </div>

    <!-- send -->
    <div class="form__send">
      <button
        :disabled="!form.email && !form.name && !form.message"
        :title="'Enviar'"
        type="submit"
        class="btn btn--primary"
      >
        <span v-if="!sending">Enviar</span>
        <span v-if="sending">Enviando…</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useForm, Field, ErrorMessage } from "vee-validate";
import { useRouter } from "vue-router";
import * as yup from "yup";
const { Swal } = useSweetAlert2();
import { useNuxtApp, useStrapiUser, useStrapi } from "#imports";
import { useAppStore } from "@/stores/app.store";
import type { User } from "~/types/user";

// Inicializa el router y strapi
const { $recaptcha } = useNuxtApp();
const router = useRouter();
const strapi = useStrapi();
const appStore = useAppStore();
const user = useStrapiUser<User>();

// Define the form schema using yup
const schema = yup.object({
  email: yup
    .string()
    .email("Correo electrónico no válido")
    .required("Correo electrónico es requerido"),
  name: yup
    .string()
    .max(30, "Nombre no puede exceder 30 caracteres")
    .required("Nombre es requerido"),
  company: yup.string().max(50, "Empresa no puede exceder 50 caracteres"),
  phone: yup
    .string()
    .max(20, "Teléfono no puede exceder 20 caracteres")
    .matches(
      /^\+?[\d\s-()]+$/,
      "El teléfono solo puede contener números, espacios, guiones, paréntesis y el signo +",
    ),
  message: yup.string().required("Mensaje es requerido"),
});

// Initialize the form
const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
});

// Define the form data
const form = ref({
  email: "",
  name: "",
  company: "",
  phone: "",
  message: "",
});

// Prellenar el formulario si el usuario está logueado
onMounted(() => {
  if (user.value) {
    form.value.email = user.value.email || "";
    form.value.name =
      `${user.value.firstname || ""} ${user.value.lastname || ""}`.trim();
    form.value.company = user.value.business_name || "";
    form.value.phone = user.value.phone || "";
  }
});

// Define the max characters prop
const props = defineProps<{
  maxChars?: number;
}>();

const maxChars = props.maxChars || 300;

// Computed property for remaining characters
const remainingChars = computed(() => {
  return maxChars - form.value.message.length;
});

const messageTextarea = ref<HTMLTextAreaElement | null>(null);
const textareaHeight = ref(80); // altura inicial

// Handle text area input
const handleTextArea = (e: Event) => {
  const textarea = e.target as HTMLTextAreaElement;

  // Verificar que el textarea y su style estén disponibles
  if (!textarea || !textarea.style) {
    return;
  }

  // Resetear altura para obtener el scrollHeight correcto
  textarea.style.setProperty("height", "80px");

  // Establecer la nueva altura basada en el contenido
  const newHeight = Math.max(80, textarea.scrollHeight);
  textarea.style.setProperty("height", newHeight + "px");
  textareaHeight.value = newHeight;

  // Manejar el límite de caracteres
  if (form.value.message.length > maxChars) {
    form.value.message = form.value.message.slice(0, maxChars);
  }
};

// Handle Strapi submission
const submitToStrapi = async (values: any, token: string) => {
  try {
    const formData = {
      fullname: values.name,
      email: values.email,
      company: values.company,
      phone: values.phone,
      message: values.message,
      recaptchaToken: token,
    };

    await strapi.create("contacts", formData);
    sending.value = false;
    appStore.setContactFormSent();
    router.push("/contacto/gracias");
  } catch (error) {
    sending.value = false;
    console.error(error);
    Swal.fire(
      "Error",
      "Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.",
      "error",
    );
  }
};

// Handle form submission
const onSubmit = handleSubmit(async (values) => {
  sending.value = true;
  try {
    // Execute reCAPTCHA v3
    const token = await $recaptcha.execute("submit");
    await submitToStrapi(values, token);
  } catch (error) {
    sending.value = false;
    console.error(error);
    Swal.fire(
      "Error",
      "Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.",
      "error",
    );
  }
});

// Sending state
const sending = ref(false);
</script>
