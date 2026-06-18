<template>
  <Form
    v-slot="{ meta }"
    :validation-schema="schema"
    :initial-values="form"
    validate-on-mount
    @submit="handleSubmit"
  >
    <client-only>
      <div class="form form--profile">
        <h2 class="form--profile__heading">Tipo de cuenta</h2>
        <p class="form--profile__lead">
          Elige cómo quieres aparecer. Cada pestaña tiene sus propios datos.
        </p>

        <div class="form--profile__segment" role="tablist">
          <button
            type="button"
            class="form--profile__segment__btn"
            :class="{
              'form--profile__segment__btn--active': profileTab === 'natural',
            }"
            @click="profileTab = 'natural'"
          >
            <IconUser :size="15" />
            Persona Natural
          </button>
          <button
            type="button"
            class="form--profile__segment__btn"
            :class="{
              'form--profile__segment__btn--active': profileTab === 'empresa',
            }"
            @click="profileTab = 'empresa'"
          >
            <IconBuilding :size="15" />
            Empresa
          </button>
        </div>

        <!-- Persona Natural -->
        <div v-show="profileTab === 'natural'">
          <h3 class="form--profile__subhead">Datos personales</h3>

          <div class="form__grid">
            <!-- Firstname -->
            <div class="form-group">
              <label class="form-label" for="firstname">Nombres</label>
              <Field
                v-model="form.firstname"
                name="firstname"
                type="text"
                class="form-control"
                maxlength="50"
                @input="handleFirstnameInput"
              />
              <ErrorMessage name="firstname" />
            </div>

            <!-- Lastname -->
            <div class="form-group">
              <label class="form-label" for="lastname">Apellidos</label>
              <Field
                v-model="form.lastname"
                name="lastname"
                type="text"
                class="form-control"
                maxlength="50"
                @input="handleLastnameInput"
              />
              <ErrorMessage name="lastname" />
            </div>

            <!-- Rut -->
            <div class="form-group">
              <label class="form-label" for="rut">RUT</label>
              <Field
                v-model="form.rut"
                name="rut"
                type="text"
                class="form-control"
                autocomplete="id"
              />
              <ErrorMessage name="rut" />
            </div>

            <!-- Birthdate -->
            <div class="form-group">
              <label class="form-label" for="birthdate"
                >Fecha de nacimiento</label
              >
              <Field
                v-model="form.birthdate"
                name="birthdate"
                type="date"
                class="form-control"
              />
              <ErrorMessage name="birthdate" />
            </div>

            <!-- Phone -->
            <div class="form-group">
              <label class="form-label" for="phone">Teléfono</label>
              <Field v-slot="{ field, handleChange: setPhone }" name="phone">
                <InputPhone
                  :value="field.value"
                  @update:model-value="
                    (val) => {
                      setPhone(val);
                      form.phone = val;
                    }
                  "
                />
              </Field>
              <ErrorMessage name="phone" />
            </div>

            <!-- WhatsApp -->
            <div class="form-group">
              <label class="form-label" for="whatsapp">WhatsApp</label>
              <Field
                v-model="form.whatsapp"
                name="whatsapp"
                type="text"
                class="form-control"
                placeholder="+56 9 1234 5678"
              />
              <ErrorMessage name="whatsapp" />
            </div>

            <!-- Email (read-only) -->
            <div class="form-group">
              <label class="form-label" for="email">Correo electrónico</label>
              <input
                id="email"
                :value="user.email"
                type="text"
                class="form-control"
                disabled
              />
            </div>

            <!-- Región -->
            <div class="form-group">
              <label class="form-label" for="region">Región</label>
              <div class="form-group--select">
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
                <IconChevronDown
                  class="form-group--select__chevron"
                  :size="18"
                />
              </div>
              <ErrorMessage name="region" />
            </div>

            <!-- Comuna -->
            <div class="form-group">
              <label class="form-label" for="commune">Comuna</label>
              <div class="form-group--select">
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
                <IconChevronDown
                  class="form-group--select__chevron"
                  :size="18"
                />
              </div>
              <ErrorMessage name="commune" />
            </div>

            <!-- Address -->
            <div class="form-group">
              <label class="form-label" for="address">Dirección</label>
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
              <label class="form-label" for="address_number">Número</label>
              <Field
                v-model="form.address_number"
                name="address_number"
                type="number"
                class="form-control"
                @input="handleAddressNumberInput"
              />
              <ErrorMessage name="address_number" />
            </div>

            <!-- Postal Code -->
            <div class="form-group">
              <label class="form-label" for="postal_code">Código postal</label>
              <Field
                v-model="form.postal_code"
                name="postal_code"
                type="number"
                class="form-control"
              />
              <ErrorMessage name="postal_code" />
            </div>
          </div>

          <!-- Bio -->
          <div class="form-group form--profile__bio">
            <label class="form-label" for="bio"
              >Descripción pública (bio)</label
            >
            <Field
              v-model="form.bio"
              as="textarea"
              name="bio"
              class="form-control form--profile__bio__field"
              maxlength="600"
              placeholder="Cuenta a los compradores quién eres, qué vendes y cómo trabajas…"
            />
            <span class="form--profile__hint">
              <IconGlobe :size="13" />
              Aparece en tu perfil público, bajo tu nombre. Visible para
              cualquier visitante.
            </span>
            <ErrorMessage name="bio" />
          </div>
        </div>

        <!-- Empresa -->
        <div v-show="profileTab === 'empresa'">
          <label
            class="form--profile__company"
            :class="{ 'form--profile__company--on': form.is_company }"
          >
            <Field
              v-model="form.is_company"
              name="is_company"
              type="checkbox"
              :value="true"
              :unchecked-value="false"
              class="form--profile__company__check"
            />
            <span class="form--profile__company__body">
              <span class="form--profile__company__title">
                Quiero mostrarme como empresa
              </span>
              <span class="form--profile__company__text">
                Marca esta casilla para habilitar y completar los datos de tu
                empresa. Tu perfil y anuncios se mostrarán con el nombre de tu
                empresa y tus compras se emitirán con
                <strong>factura</strong>.
              </span>
            </span>
          </label>

          <h3
            class="form--profile__subhead"
            :class="{ 'form--profile__subhead--muted': !form.is_company }"
          >
            Datos de la empresa
          </h3>

          <div class="form__grid">
            <div class="form-group">
              <label class="form-label" for="business_name">Razón social</label>
              <Field
                v-model="form.business_name"
                name="business_name"
                type="text"
                class="form-control"
                maxlength="50"
                :disabled="!form.is_company"
                placeholder="Ej. Maestranza del Sur SpA"
                @input="handleBusinessNameInput"
              />
              <ErrorMessage name="business_name" />
            </div>

            <div class="form-group">
              <label class="form-label" for="business_type">Giro</label>
              <Field
                v-model="form.business_type"
                name="business_type"
                type="text"
                class="form-control"
                maxlength="80"
                :disabled="!form.is_company"
                placeholder="Ej. Venta de maquinaria"
                @input="handleBusinessTypeInput"
              />
              <ErrorMessage name="business_type" />
            </div>

            <div class="form-group">
              <label class="form-label" for="business_rut">RUT empresa</label>
              <Field
                v-model="form.business_rut"
                name="business_rut"
                type="text"
                class="form-control"
                :disabled="!form.is_company"
                placeholder="76.123.456-7"
              />
              <ErrorMessage name="business_rut" />
            </div>

            <div class="form-group">
              <label class="form-label" for="business_address"
                >Dirección empresa</label
              >
              <Field
                v-model="form.business_address"
                name="business_address"
                type="text"
                class="form-control"
                :disabled="!form.is_company"
                placeholder="Calle y número"
              />
              <ErrorMessage name="business_address" />
            </div>

            <div class="form-group">
              <label class="form-label" for="business_address_number"
                >Número empresa</label
              >
              <Field
                v-model="form.business_address_number"
                name="business_address_number"
                type="number"
                class="form-control"
                :disabled="!form.is_company"
                @input="handleBusinessAddressNumberInput"
              />
              <ErrorMessage name="business_address_number" />
            </div>

            <div class="form-group">
              <label class="form-label" for="business_postal_code"
                >Código postal empresa</label
              >
              <Field
                v-model="form.business_postal_code"
                name="business_postal_code"
                type="number"
                class="form-control"
                :disabled="!form.is_company"
              />
              <ErrorMessage name="business_postal_code" />
            </div>

            <div class="form-group">
              <label class="form-label" for="business_region"
                >Región empresa</label
              >
              <div class="form-group--select">
                <Field
                  v-model="selectedBusinessRegionId"
                  as="select"
                  name="business_region"
                  class="form-control"
                  :disabled="!form.is_company"
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
                <IconChevronDown
                  class="form-group--select__chevron"
                  :size="18"
                />
              </div>
              <ErrorMessage name="business_region" />
            </div>

            <div class="form-group">
              <label class="form-label" for="business_commune"
                >Comuna empresa</label
              >
              <div class="form-group--select">
                <Field
                  v-model="form.business_commune"
                  as="select"
                  name="business_commune"
                  class="form-control"
                  :disabled="!form.is_company"
                >
                  <option value="">Seleccione una comuna</option>
                  <option
                    v-for="item in filteredBusinessCommunes"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.name }}
                  </option>
                </Field>
                <IconChevronDown
                  class="form-group--select__chevron"
                  :size="18"
                />
              </div>
              <ErrorMessage name="business_commune" />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="form--profile__actions">
          <NuxtLink to="/cuenta/perfil" class="btn btn--secondary">
            Cancelar
          </NuxtLink>
          <button
            :disabled="
              !meta.valid || sending || (!onboardingMode && !hasChanges)
            "
            :title="`Guardar cambios`"
            type="submit"
            class="btn btn--primary"
          >
            <span v-if="!sending">Guardar cambios</span>
            <span v-if="sending">Guardando…</span>
          </button>
        </div>
      </div>
    </client-only>
  </Form>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { Field, Form, ErrorMessage } from "vee-validate";
import {
  User as IconUser,
  Building2 as IconBuilding,
  ChevronDown as IconChevronDown,
  Globe as IconGlobe,
} from "lucide-vue-next";
import * as yup from "yup";

const emit = defineEmits(["success"]);
const props = defineProps({
  onboardingMode: { type: Boolean, default: false },
});

const { Swal } = useSweetAlert2();
import { useNuxtApp } from "#app";
import { useRut } from "@/composables/useRut";
import { useLogger } from "@/composables/useLogger";
import { useValidation } from "@/composables/useValidation";

import { useRegionsStore } from "@/stores/regions.store";
import { useCommunesStore } from "@/stores/communes.store";
import { useUserStore } from "@/stores/user.store";

const sending = ref(false);

// Which account-type panel is being edited. Pure UI state — independent of
// is_company (the checkbox inside the Empresa panel drives company status).
const profileTab = ref("natural");

const regionsStore = import.meta.client
  ? useRegionsStore()
  : /** @type {ReturnType<typeof useRegionsStore>} */ ({});
const listRegions = computed(() => regionsStore.regions?.data ?? []);

const communesStore = import.meta.client
  ? useCommunesStore()
  : /** @type {ReturnType<typeof useCommunesStore>} */ ({});
const listCommunes = computed(() => communesStore.communes?.data ?? []);

const userStore = import.meta.client
  ? useUserStore()
  : /** @type {ReturnType<typeof useUserStore>} */ ({});

const selectedRegionId = ref(null);

const normalizeId = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const filteredCommunes = computed(() => {
  const regionId = normalizeId(selectedRegionId.value);
  if (!regionId) return [];

  return listCommunes.value.filter((commune) => commune.region.id === regionId);
});

const user = useSessionUser();
const { fetchUser } = useSessionAuth();

const selectedBusinessRegionId = ref(null);

const filteredBusinessCommunes = computed(() => {
  const regionId = normalizeId(selectedBusinessRegionId.value);
  if (!regionId) return [];

  return listCommunes.value.filter((commune) => commune.region.id === regionId);
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
  whatsapp: user.value.whatsapp || "",
  bio: user.value.bio || "",
  address: user.value.address || "",
  address_number: user.value.address_number || "",
  postal_code: user.value.postal_code || "",
  is_company:
    user.value.is_company !== undefined ? user.value.is_company : null,
  region:
    normalizeId(user.value.region?.id) ||
    normalizeId(user.value.commune?.region?.id),
  commune: user.value.commune?.id || null,
  birthdate: user.value.birthdate || "",
  business_name: user.value.business_name || "",
  business_type: user.value.business_type || "",
  business_rut: user.value.business_rut || "",
  business_address: user.value.business_address || "",
  business_address_number: user.value.business_address_number || "",
  business_postal_code: user.value.business_postal_code || "",
  business_region:
    normalizeId(user.value.business_region?.id) ||
    normalizeId(user.value.business_commune?.region?.id),
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
  whatsapp: user.value.whatsapp || "",
  bio: user.value.bio || "",
  address: user.value.address || "",
  address_number: user.value.address_number || "",
  postal_code: user.value.postal_code || "",
  is_company:
    user.value.is_company !== undefined ? user.value.is_company : null,
  region:
    normalizeId(user.value.region?.id) ||
    normalizeId(user.value.commune?.region?.id),
  commune: user.value.commune?.id || null,
  birthdate: user.value.birthdate || "",
  // Campos de empresa
  business_name: user.value.business_name || "",
  business_type: user.value.business_type || "",
  business_rut: user.value.business_rut || "",
  business_address: user.value.business_address || "",
  business_address_number: user.value.business_address_number || "",
  business_postal_code: user.value.business_postal_code || "",
  business_region:
    normalizeId(user.value.business_region?.id) ||
    normalizeId(user.value.business_commune?.region?.id),
  business_commune: user.value.business_commune?.id || null,
});

// Open the Empresa panel by default when the user is already a company.
if (form.value.is_company) {
  profileTab.value = "empresa";
}

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
    .max(50, "El Nombre no puede tener más de 50 caracteres")
    .test("is-valid-name", "Nombre no válido", (value) =>
      isValidName(value || ""),
    ),
  lastname: yup
    .string()
    .required("El Apellido es requerido")
    .max(50, "El Apellido no puede tener más de 50 caracteres")
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
  whatsapp: yup
    .string()
    .nullable()
    .max(20, "El WhatsApp no puede exceder los 20 caracteres")
    .matches(/^[\d\s()+-]*$/, {
      message:
        "El WhatsApp solo puede contener números, +, espacios, paréntesis y guiones",
      excludeEmptyString: true,
    }),
  bio: yup
    .string()
    .nullable()
    .max(600, "La descripción no puede exceder los 600 caracteres"),
  address: yup
    .string()
    .required("Dirección es requerida")
    .test("is-valid-address", "Dirección no válida", (value) =>
      isValidAddress(value || ""),
    ),
  address_number: yup
    .string()
    .required("Número de Dirección es requerido")
    .max(5, "El Número de Dirección no puede tener más de 5 caracteres"),
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
        .max(50, "Razón Social no puede tener más de 50 caracteres")
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
      schema
        .required("Número de Dirección Empresa es requerido")
        .max(
          5,
          "El Número de Dirección Empresa no puede tener más de 5 caracteres",
        ),
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

watch(
  selectedRegionId,
  (value) => {
    form.value.region = normalizeId(value);
  },
  { immediate: true },
);

watch(
  selectedBusinessRegionId,
  (value) => {
    form.value.business_region = normalizeId(value);
  },
  { immediate: true },
);

// Regions and communes are pre-loaded by the parent page (perfil/editar.vue) via useAsyncData.
// Derive selectedRegionId from the commune after the stores are populated.
// onMounted: UI-only — derives local state from pre-hydrated store data (no API call)
onMounted(() => {
  if (!normalizeId(selectedRegionId.value) && form.value.commune) {
    const commune = listCommunes.value.find(
      (item) => item.id === normalizeId(form.value.commune),
    );
    if (commune?.region?.id) {
      selectedRegionId.value = commune.region.id;
    }
  }

  if (
    !normalizeId(selectedBusinessRegionId.value) &&
    form.value.business_commune
  ) {
    const businessCommune = listCommunes.value.find(
      (item) => item.id === normalizeId(form.value.business_commune),
    );
    if (businessCommune?.region?.id) {
      selectedBusinessRegionId.value = businessCommune.region.id;
    }
  }
});

const handleSubmit = async (values) => {
  sending.value = true;

  try {
    const mappedValues = {
      ...values,
      phone: String(values.phone),
      address_number: values.address_number
        ? Number.parseInt(values.address_number, 10)
        : null,
      business_address_number: values.business_address_number
        ? Number.parseInt(values.business_address_number, 10)
        : null,
    };

    // Usar la función del store para actualizar el perfil
    await userStore.updateUserProfile(user.value.id, mappedValues);
    await fetchUser();
    useMeStore().reset();

    // Log successful profile update
    logInfo(`User profile updated successfully.`);

    // Mostrar mensaje de éxito
    await Swal.fire({
      text: "Usuario actualizado correctamente",
      icon: "success",
      confirmButtonText: "Aceptar",
    });

    // Notify parent and conditionally redirect
    emit("success");
    if (!props.onboardingMode) {
      window.location.href = "/cuenta/perfil";
    }
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
  if (form.value.firstname.length > 50) {
    form.value.firstname = form.value.firstname.slice(0, 50);
  }
};

const handleLastnameInput = () => {
  if (form.value.lastname.length > 50) {
    form.value.lastname = form.value.lastname.slice(0, 50);
  }
};

const handleBusinessNameInput = () => {
  if (form.value.business_name.length > 50) {
    form.value.business_name = form.value.business_name.slice(0, 50);
  }
};

const handleBusinessTypeInput = () => {
  if (form.value.business_type.length > 80) {
    form.value.business_type = form.value.business_type.slice(0, 80);
  }
};

const handleAddressNumberInput = (event) => {
  const sliced = String(event.target.value || "").slice(0, 5);
  event.target.value = sliced;
  form.value.address_number = sliced ? Number.parseInt(sliced, 10) : "";
};

const handleBusinessAddressNumberInput = (event) => {
  const sliced = String(event.target.value || "").slice(0, 5);
  event.target.value = sliced;
  form.value.business_address_number = sliced
    ? Number.parseInt(sliced, 10)
    : "";
};
</script>
