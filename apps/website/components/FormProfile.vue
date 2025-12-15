<template>
  <Form
    v-slot="{ errors, meta }"
    :validation-schema="schema"
    :initial-values="form"
    validate-on-mount
    @submit="handleSubmit"
  >
    <client-only>
      <div class="form form--profile">
        <!-- <pre>{{ user.is_company }}</pre> -->

        <div class="form__grid">
          <!-- Is Company -->
          <div class="form-group">
            <label class="form-label" for="is_company">Tipo</label>
            <Field
              v-model="form.is_company"
              as="select"
              name="is_company"
              class="form-control"
            >
              <option :value="null" disabled>Seleccione un tipo</option>
              <option :value="false">Persona Natural</option>
              <option :value="true">Empresa</option>
            </Field>
            <ErrorMessage name="is_company" />
          </div>
        </div>

        <div class="form__subtitle">Datos Personales</div>

        <div class="form__grid">
          <!-- Fecha de Nacimiento -->
          <div class="form-group">
            <label class="form-label" for="birthdate"
              >Fecha de Nacimiento *</label
            >
            <Field
              v-model="form.birthdate"
              name="birthdate"
              type="date"
              class="form-control"
            />
            <ErrorMessage name="birthdate" />
          </div>

          <!-- Firstname -->
          <div class="form-group">
            <label class="form-label" for="firstname">Nombres *</label>
            <Field
              v-model="form.firstname"
              name="firstname"
              type="text"
              class="form-control"
              maxlength="25"
              @input="handleFirstnameInput"
            />
            <ErrorMessage name="firstname" />
          </div>

          <!-- Lastname -->
          <div class="form-group">
            <label class="form-label" for="lastname">Apellidos *</label>
            <Field
              v-model="form.lastname"
              name="lastname"
              type="text"
              class="form-control"
              maxlength="25"
              @input="handleLastnameInput"
            />
            <ErrorMessage name="lastname" />
          </div>

          <!-- Rut -->
          <div class="form-group">
            <label class="form-label" for="rut">Rut *</label>
            <Field
              v-model="form.rut"
              name="rut"
              type="text"
              class="form-control"
              autocomplete="id"
            />
            <ErrorMessage name="rut" />
          </div>

          <!-- Phone -->
          <div class="form-group">
            <label class="form-label" for="phone">Teléfono *</label>
            <Field
              v-model="form.phone"
              name="phone"
              type="phone"
              placeholder="5694269xxxx"
              class="form-control"
              @input="handlePhoneInput"
            />
            <ErrorMessage name="phone" />
          </div>

          <!-- Address -->
          <div class="form-group">
            <label class="form-label" for="address">Dirección *</label>
            <Field
              v-model="form.address"
              name="address"
              type="text"
              class="form-control"
            />
            <ErrorMessage name="address" />
          </div>

          <!-- Address Number -->
          <div class="form-group">
            <label class="form-label" for="address_number"
              >Número de Dirección *</label
            >
            <Field
              v-model="form.address_number"
              name="address_number"
              type="number"
              class="form-control"
            />
            <ErrorMessage name="address_number" />
          </div>

          <!-- Postal Code -->
          <div class="form-group">
            <label class="form-label" for="postal_code">Código Postal</label>
            <Field
              v-model="form.postal_code"
              name="postal_code"
              type="number"
              class="form-control"
            />
            <ErrorMessage name="postal_code" />
          </div>

          <!-- Región -->
          <div class="form-group">
            <!-- <pre>{{ selectedRegionId }}</pre> -->
            <label class="form-label" for="region">Región *</label>
            <Field
              v-model="selectedRegionId"
              as="select"
              name="region"
              class="form-control"
            >
              <option value="">Seleccione una región</option>
              <option
                v-for="item in listRegions"
                :key="item.id"
                :value="item.id"
              >
                {{ item.name }}
              </option>
            </Field>
            <ErrorMessage name="region" />
          </div>

          <!-- Comuna -->
          <div class="form-group">
            <!-- <pre>{{ form.commune }}</pre> -->
            <label class="form-label" for="commune">Comuna *</label>
            <Field
              v-model="form.commune"
              as="select"
              name="commune"
              class="form-control"
            >
              <option value="">Seleccione una comuna</option>
              <option
                v-for="item in filteredCommunes"
                :key="item.id"
                :value="item.id"
              >
                {{ item.name }}
              </option>
            </Field>
            <ErrorMessage name="commune" />
          </div>
        </div>

        <div v-if="form.is_company" class="form__subtitle">
          Datos de la Empresa
        </div>

        <div v-if="form.is_company" class="form__grid">
          <div class="form-group">
            <label class="form-label" for="business_name">Razón Social *</label>
            <Field
              v-model="form.business_name"
              name="business_name"
              type="text"
              class="form-control"
              maxlength="25"
              @input="handleBusinessNameInput"
            />
            <ErrorMessage name="business_name" />
          </div>

          <div class="form-group">
            <label class="form-label" for="business_type">Giro *</label>
            <Field
              v-model="form.business_type"
              name="business_type"
              type="text"
              class="form-control"
              maxlength="80"
              @input="handleBusinessTypeInput"
            />
            <ErrorMessage name="business_type" />
          </div>

          <div class="form-group">
            <label class="form-label" for="business_rut">Rut Empresa *</label>
            <Field
              v-model="form.business_rut"
              name="business_rut"
              type="text"
              class="form-control"
            />
            <ErrorMessage name="business_rut" />
          </div>

          <div class="form-group">
            <label class="form-label" for="business_address"
              >Dirección Empresa *</label
            >
            <Field
              v-model="form.business_address"
              name="business_address"
              type="text"
              class="form-control"
            />
            <ErrorMessage name="business_address" />
          </div>

          <div class="form-group">
            <label class="form-label" for="business_address_number"
              >Número de Dirección Empresa *</label
            >
            <Field
              v-model="form.business_address_number"
              name="business_address_number"
              type="number"
              class="form-control"
            />
            <ErrorMessage name="business_address_number" />
          </div>

          <div class="form-group">
            <label class="form-label" for="business_postal_code"
              >Código Postal Empresa</label
            >
            <Field
              v-model="form.business_postal_code"
              name="business_postal_code"
              type="number"
              class="form-control"
            />
            <ErrorMessage name="business_postal_code" />
          </div>

          <div class="form-group">
            <label class="form-label" for="business_region"
              >Región Empresa *</label
            >
            <Field
              v-model="selectedBusinessRegionId"
              as="select"
              name="business_region"
              class="form-control"
            >
              <option value="">Seleccione una región</option>
              <option
                v-for="item in listRegions"
                :key="item.id"
                :value="item.id"
              >
                {{ item.name }}
              </option>
            </Field>
            <ErrorMessage name="business_region" />
          </div>

          <div class="form-group">
            <label class="form-label" for="business_commune"
              >Comuna Empresa *</label
            >
            <Field
              v-model="form.business_commune"
              as="select"
              name="business_commune"
              class="form-control"
            >
              <!-- <option value="">Seleccione una comuna</option> -->
              <option
                v-for="item in filteredBusinessCommunes"
                :key="item.id"
                :value="item.id"
              >
                {{ item.name }}
              </option>
            </Field>
            <ErrorMessage name="business_commune" />
          </div>
        </div>

        <button
          :disabled="!meta.valid || sending || !hasChanges"
          :title="`Actualizar`"
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
import { ref, computed, onMounted, watch } from "vue";
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";
const { Swal } = useSweetAlert2();
import { useNuxtApp } from "#app";
import { useRut } from "@/composables/useRut";
import { useLogger } from "@/composables/useLogger";
import { useValidation } from "@/composables/useValidation";
import { useRouter } from "vue-router";

import { useRegionsStore } from "@/stores/regions.store";
import { useCommunesStore } from "@/stores/communes.store";
import { useUserStore } from "@/stores/user.store";

const sending = ref(false);
const { $recaptcha } = useNuxtApp();
const router = useRouter();

const regionsStore = useRegionsStore();
const listRegions = computed(() => regionsStore.regions.data);

const communesStore = useCommunesStore();
const listCommunes = computed(() => communesStore.communes.data || []);

const userStore = useUserStore();

const selectedRegionId = ref(null);

const filteredCommunes = computed(() => {
  return listCommunes.value.filter(
    (commune) => commune.region.id === selectedRegionId.value,
  );
});

const strapi = useStrapi();
const user = useStrapiUser();
const { fetchUser } = useStrapiAuth();

const selectedBusinessRegionId = ref(null);

const filteredBusinessCommunes = computed(() => {
  return listCommunes.value.filter(
    (commune) => commune.region.id === selectedBusinessRegionId.value,
  );
});

const { formatRut, validateRut } = useRut();
const { logInfo } = useLogger();
const { isValidName, isValidAddress } = useValidation();

// Guardar valores iniciales
const initialFormValues = ref({
  firstname: user.value.firstname || "",
  lastname: user.value.lastname || "",
  rut: user.value.rut || "",
  phone: user.value.phone || "",
  address: user.value.address || "",
  address_number: user.value.address_number || "",
  postal_code: user.value.postal_code || "",
  is_company:
    user.value.is_company !== undefined ? user.value.is_company : null,
  region: user.value.region?.id || null,
  commune: user.value.commune?.id || null,
  birthdate: user.value.birthdate || "",
  business_name: user.value.business_name || "",
  business_type: user.value.business_type || "",
  business_rut: user.value.business_rut || "",
  business_address: user.value.business_address || "",
  business_address_number: user.value.business_address_number || "",
  business_postal_code: user.value.business_postal_code || "",
  business_region: user.value.business_region?.id || null,
  business_commune: user.value.business_commune?.id || null,
});

const hasChanges = computed(() => {
  return Object.keys(form.value).some((key) => {
    return form.value[key] !== initialFormValues.value[key];
  });
});

const form = ref({
  firstname: user.value.firstname || "",
  lastname: user.value.lastname || "",
  rut: user.value.rut || "",
  phone: user.value.phone || "",
  address: user.value.address || "",
  address_number: user.value.address_number || "",
  postal_code: user.value.postal_code || "",
  is_company:
    user.value.is_company !== undefined ? user.value.is_company : null,
  region: user.value.region?.id || null,
  commune: user.value.commune?.id || null,
  birthdate: user.value.birthdate || "",
  // Campos de empresa
  business_name: user.value.business_name || "",
  business_type: user.value.business_type || "",
  business_rut: user.value.business_rut || "",
  business_address: user.value.business_address || "",
  business_address_number: user.value.business_address_number || "",
  business_postal_code: user.value.business_postal_code || "",
  business_region: user.value.business_region?.id || null,
  business_commune: user.value.business_commune?.id || null,
});

// Watch para formatear el RUT al ir ingresándolo
watch(
  () => form.value.rut,
  (newRut) => {
    form.value.rut = formatRut(newRut);
  },
);

// Watch para formatear el RUT de empresa al ir ingresándolo
watch(
  () => form.value.business_rut,
  (newRut) => {
    form.value.business_rut = formatRut(newRut);
  },
);

const schema = yup.object({
  firstname: yup
    .string()
    .required("El Nombre es requerido")
    .max(25, "El Nombre no puede tener más de 25 caracteres")
    .test("is-valid-name", "Nombre no válido", (value) =>
      isValidName(value || ""),
    ),
  lastname: yup
    .string()
    .required("El Apellido es requerido")
    .max(25, "El Apellido no puede tener más de 25 caracteres")
    .test("is-valid-name", "Apellido no válido", (value) =>
      isValidName(value || ""),
    ),
  rut: yup
    .string()
    .required("Rut es requerido")
    .test("is-valid-rut", "RUT no es válido", (value) =>
      validateRut(value || ""),
    )
    .test(
      "different-from-business-rut",
      "El RUT personal no puede ser igual al RUT de la empresa",
      function (value) {
        const { business_rut, is_company } = this.parent;
        if (is_company && business_rut && value) {
          // Remover puntos y guiones para comparar
          const cleanRut = value.replace(/[.-]/g, "");
          const cleanBusinessRut = business_rut.replace(/[.-]/g, "");
          return cleanRut !== cleanBusinessRut;
        }
        return true;
      },
    ),
  phone: yup
    .string()
    .required("Teléfono es requerido")
    .min(11, "El teléfono debe tener al menos 11 caracteres")
    .max(20, "El teléfono no puede exceder los 20 caracteres")
    .matches(
      /^[\d\s()+-]+$/,
      "El teléfono solo puede contener números, +, espacios, paréntesis y guiones",
    ),
  address: yup
    .string()
    .required("Dirección es requerida")
    .test("is-valid-address", "Dirección no válida", (value) =>
      isValidAddress(value || ""),
    ),
  address_number: yup.string().required("Número de Dirección es requerido"),
  postal_code: yup
    .string()
    .nullable()
    .matches(/^\d*$/, "El Código Postal debe ser numérico")
    .max(10, "El Código Postal no debe tener más de 10 caracteres"),
  is_company: yup.boolean().required("Tipo es requerido"),
  region: yup.string().required("Región es requerida"),
  commune: yup.string().required("Comuna es requerida"),
  birthdate: yup
    .date()
    .typeError("Fecha de Nacimiento debe ser una fecha válida")
    .required("Fecha de Nacimiento es requerida")
    .max(
      new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
      "Debes ser mayor de 18 años",
    ),
  // Validaciones de empresa
  business_name: yup.string().when("is_company", {
    is: true,
    then: (schema) =>
      schema
        .required("Razón Social es requerida")
        .max(25, "Razón Social no puede tener más de 25 caracteres")
        .test("is-valid-name", "Razón Social no válida", (value) =>
          isValidName(value || ""),
        ),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  business_type: yup.string().when("is_company", {
    is: true,
    then: (schema) =>
      schema
        .required("Giro es requerido")
        .test("is-valid-name", "Giro no válido", (value) =>
          isValidName(value || ""),
        ),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  business_rut: yup.string().when("is_company", {
    is: true,
    then: (schema) =>
      schema
        .required("Rut Empresa es requerido")
        .test("is-valid-rut", "RUT no es válido", (value) =>
          validateRut(value || ""),
        )
        .test(
          "different-from-personal-rut",
          "El RUT de la empresa no puede ser igual al RUT personal",
          function (value) {
            const { rut } = this.parent;
            if (rut && value) {
              // Remover puntos y guiones para comparar
              const cleanRut = rut.replace(/[.-]/g, "");
              const cleanBusinessRut = value.replace(/[.-]/g, "");
              return cleanRut !== cleanBusinessRut;
            }
            return true;
          },
        ),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  business_address: yup.string().when("is_company", {
    is: true,
    then: (schema) =>
      schema
        .required("Dirección Empresa es requerida")
        .test("is-valid-address", "Dirección Empresa no válida", (value) =>
          isValidAddress(value || ""),
        ),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  business_address_number: yup.string().when("is_company", {
    is: true,
    then: (schema) =>
      schema.required("Número de Dirección Empresa es requerido"),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  business_postal_code: yup.string().when("is_company", {
    is: true,
    then: (schema) =>
      schema
        .nullable()
        .matches(/^\d*$/, "El Código Postal Empresa debe ser numérico")
        .max(10, "El Código Postal Empresa no debe tener más de 10 caracteres"),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  business_region: yup.string().when("is_company", {
    is: true,
    then: (schema) => schema.required("Región Empresa es requerida"),
    otherwise: (schema) => schema.nullable().optional(),
  }),
  business_commune: yup.string().when("is_company", {
    is: true,
    then: (schema) => schema.required("Comuna Empresa es requerida"),
    otherwise: (schema) => schema.nullable().optional(),
  }),
});

selectedRegionId.value = form.value.region;
selectedBusinessRegionId.value = form.value.business_region;

// Cargar regiones y comunas al montar el componente
onMounted(async () => {
  await regionsStore.loadRegions();
  await communesStore.loadCommunes();
});

const handleSubmit = async (values) => {
  sending.value = true;

  try {
    // Execute reCAPTCHA v3
    const recaptchaToken = await $recaptcha.execute("submit");

    const mappedValues = {
      ...values,
      phone: String(values.phone),
      recaptchaToken,
    };

    // Usar la función del store para actualizar el perfil
    await userStore.updateUserProfile(user.value.id, mappedValues);
    await fetchUser();

    // Log successful profile update
    logInfo(`User profile updated successfully.`);

    // Mostrar mensaje de éxito
    await Swal.fire({
      text: "Usuario actualizado correctamente",
      icon: "success",
      confirmButtonText: "Aceptar",
    });

    // Recargar la página para actualizar los datos
    window.location.href = "/cuenta/perfil";
  } catch (error) {
    console.error("Error updating user:", error);

    // Obtener el mensaje de error más específico
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Hubo un error. Por favor, inténtalo de nuevo.";

    Swal.fire({
      title: "Error",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    sending.value = false;
  }
};

const handleFirstnameInput = () => {
  if (form.value.firstname.length > 25) {
    form.value.firstname = form.value.firstname.slice(0, 25);
  }
};

const handleLastnameInput = () => {
  if (form.value.lastname.length > 25) {
    form.value.lastname = form.value.lastname.slice(0, 25);
  }
};

const handleBusinessNameInput = () => {
  if (form.value.business_name.length > 25) {
    form.value.business_name = form.value.business_name.slice(0, 25);
  }
};

const handleBusinessTypeInput = () => {
  if (form.value.business_type.length > 80) {
    form.value.business_type = form.value.business_type.slice(0, 80);
  }
};

const handlePhoneInput = (event) => {
  // Remover caracteres no permitidos
  const value = event.target.value.replace(/[^\d\s()+-]/g, "");
  // Limitar a 20 caracteres
  form.value.phone = value.slice(0, 20);
};
</script>
