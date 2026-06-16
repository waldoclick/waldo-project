<template>
  <Form v-slot="{ meta }" :validation-schema="schema" @submit="onSubmit">
    <Field v-model="form.code" name="code" type="hidden" />

    <div class="form-group form-group--password form-group--withgen">
      <div class="form-group--password__topbar">
        <label class="form-label" for="password">Nueva Contraseña</label>
        <button
          type="button"
          class="form-group--password__generate"
          @click="handleGeneratePassword"
        >
          <IconSparkles :size="13" /> Generar segura
        </button>
      </div>
      <div class="form-group--password__field">
        <Field
          v-model="form.password"
          name="password"
          :type="passwordType"
          class="form-control"
          placeholder="Crea una contraseña"
          autocomplete="new-password"
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
      </div>
      <ErrorMessage name="password" />
      <PasswordStrength :password="form.password" />
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
        placeholder="Repite tu contraseña"
        autocomplete="new-password"
        maxlength="50"
      />
      <ErrorMessage name="confirm_password" />
    </div>

    <button
      :disabled="!meta.valid || loading"
      type="submit"
      class="btn btn--block btn--primary"
    >
      <span v-if="!loading">Guardar contraseña</span>
      <span v-if="loading">Restableciendo…</span>
    </button>
  </Form>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Sparkles as IconSparkles } from "lucide-vue-next";
import { useRouter, useRoute } from "vue-router";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
const { Swal } = useSweetAlert2();

const schema = yup.object({
  code: yup.string().required("Código de restablecimiento es requerido"),
  password: yup
    .string()
    .required("Nueva contraseña es requerida")
    .min(8, "Mínimo 8 caracteres")
    .max(50, "Máximo 50 caracteres")
    .matches(/[A-Z]/, "Debe incluir al menos una mayúscula")
    .matches(/[a-z]/, "Debe incluir al menos una minúscula")
    .matches(/\d/, "Debe incluir al menos un número"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required("Debes repetir la nueva contraseña"),
});

const route = useRoute();

// onMounted: UI-only — validates presence of reset token from URL query param; shows 404 if missing
onMounted(() => {
  if (!route.query.token) {
    showError({
      statusCode: 404,
      message: "Token no válido",
      statusMessage: "El enlace para restablecer la contraseña no es válido",
    });
  }
});

const form = ref({
  code: (route.query.token as string) || "",
  password: "",
  confirm_password: "",
});

const loading = ref(false);
const passwordType = ref("password");
const apiClient = useApiClient();
const router = useRouter();

const onSubmit = async (values: Record<string, unknown>) => {
  loading.value = true;

  try {
    await apiClient("/auth/reset-password", {
      method: "POST",
      body: {
        code: values.code as string,
        password: values.password as string,
        passwordConfirmation: values.confirm_password as string,
      },
    });

    Swal.fire("Éxito", "Contraseña restablecida con éxito.", "success");
    router.push("/");
  } catch (err) {
    const message =
      (err as { data?: { error?: { message?: string } } })?.data?.error
        ?.message ?? "";
    const isExpired = /expir|invalid|incorrect|caducad/i.test(message);

    await Swal.fire(
      "Error",
      isExpired
        ? "El enlace de restablecimiento ha expirado o no es válido. Solicita uno nuevo."
        : "Hubo un error al restablecer la contraseña. Por favor, inténtalo de nuevo.",
      "error",
    );

    if (isExpired) {
      router.push("/recuperar-contrasena");
    }
  } finally {
    loading.value = false;
  }
};

const handleShowPassword = () => {
  passwordType.value = passwordType.value === "password" ? "text" : "password";
};

const handleGeneratePassword = () => {
  const pwd = generateSecurePassword();
  form.value.password = pwd;
  form.value.confirm_password = pwd;
  passwordType.value = "text";
};
</script>
