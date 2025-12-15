<template>
  <!-- <pre>{{ user }}</pre> -->
  <Form
    v-slot="{ errors, meta }"
    :validation-schema="schema"
    :initial-values="form"
    validate-on-mount
    class="form form--create"
    @submit="handleSubmit"
  >
    <!-- Introduce -->
    <div class="form__field">
      <h2 class="form__title">Confirmanos tus datos personales</h2>
      <div class="form__description">
        <p>
          Proporciona tus datos de forma precisa para asegurar el éxito de tu
          anuncio.
        </p>
      </div>
    </div>

    <div class="form__grid">
      <!-- Email -->
      <div class="form__field">
        <div class="form-group">
          <label class="form-label" for="email">* Email</label>
          <Field
            v-model="form.email"
            name="email"
            type="email"
            class="form-control"
          />
          <ErrorMessage name="email" />
        </div>
      </div>

      <!-- Teléfono -->
      <div class="form__field">
        <div class="form-group">
          <label class="form-label" for="phone">* Teléfono</label>
          <Field
            v-model="form.phone"
            name="phone"
            type="text"
            class="form-control"
            maxlength="20"
            @input="handlePhoneInput"
          />
          <ErrorMessage name="phone" />
        </div>
      </div>

      <!-- Región -->
      <div class="form-group">
        <label class="form-label" for="region">Región</label>
        <Field
          v-model="form.region"
          as="select"
          name="region"
          class="form-control"
          @change="handleRegionChange"
        >
          <option :value="null" disabled>Selecciona una región</option>
          <option v-for="item in listRegions" :key="item.id" :value="item.id">
            {{ item.name }}
          </option>
        </Field>
        <ErrorMessage name="region" />
      </div>

      <!-- Comuna -->
      <div class="form-group">
        <label class="form-label" for="commune">Comuna</label>
        <Field
          v-model="form.commune"
          as="select"
          name="commune"
          class="form-control"
        >
          <option :value="null" disabled>Selecciona una comuna</option>
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

      <!-- Dirección -->
      <div class="form__field">
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
      </div>

      <!-- Número de Dirección -->
      <div class="form__field">
        <div class="form-group">
          <label class="form-label" for="addressNumber">
            Número de Dirección
          </label>
          <Field
            v-model="form.addressNumber"
            name="addressNumber"
            type="text"
            class="form-control"
            maxlength="5"
            @input="handleAddressNumberInput"
          />
          <ErrorMessage name="addressNumber" />
        </div>
      </div>
    </div>

    <BarCreate
      :percentage="50"
      :current-step="3"
      :total-steps="5"
      :is-valid="meta.valid"
      @submit="handleSubmit"
      @back="handleformBack"
    />

    <pre>{{ user.value }}</pre>
  </Form>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";

import { useAdStore } from "~/stores/ad.store";
import { useRegionsStore } from "@/stores/regions.store";
import { useCommunesStore } from "@/stores/communes.store";
import BarCreate from "@/components/BarCreate.vue";

const emit = defineEmits(["formSubmitted", "formBack"]);

const user = useStrapiUser();

// Define las reglas de validación
const schema = yup.object({
  email: yup
    .string()
    .required("El email es requerido")
    .email("Debe ser un email válido"),
  phone: yup
    .string()
    .required("El teléfono es requerido")
    .min(11, "El teléfono debe tener al menos 11 caracteres")
    .max(20, "El teléfono no puede exceder los 20 caracteres")
    .matches(
      /^[\d\s()+-]+$/,
      "El teléfono solo puede contener números, +, espacios, paréntesis y guiones",
    ),
  region: yup.number().nullable(),
  commune: yup.number().nullable(),
  address: yup.string(),
  addressNumber: yup
    .string()
    .matches(/^\d+$/, "El número de dirección solo puede contener números")
    .max(5, "El número de dirección no puede exceder los 5 caracteres"),
});

const adStore = useAdStore();

const selectedRegionId = ref(
  adStore.ad.region || user.value?.region?.id || null,
);

const form = ref({
  email: adStore.ad.email || user.value?.email || "",
  phone: adStore.ad.phone || user.value?.phone || "",
  region: adStore.ad.region || user.value?.region?.id || null,
  commune:
    adStore.ad.commune !== undefined && adStore.ad.commune !== null
      ? adStore.ad.commune
      : user.value?.commune?.id || null,
  address: adStore.ad.address || user.value?.address || "",
  addressNumber: adStore.ad.address_number || user.value?.address_number || "",
});

const regionsStore = useRegionsStore();
const listRegions = computed(() => regionsStore.regions.data);

const communesStore = useCommunesStore();
const listCommunes = computed(() => communesStore.communes.data || []);

const filteredCommunes = computed(() => {
  if (!selectedRegionId.value) return [];
  return listCommunes.value.filter(
    (commune) => commune.region.id === selectedRegionId.value,
  );
});

const handleRegionChange = () => {
  form.value.commune = null; // Resetear la comuna seleccionada
  selectedRegionId.value = form.value.region; // Actualizar la región seleccionada
};

const handlePhoneInput = (event) => {
  // Remover caracteres no permitidos
  const value = event.target.value.replace(/[^\d\s()+-]/g, "");
  // Limitar a 20 caracteres
  form.value.phone = value.slice(0, 20);
};

const handleAddressNumberInput = (event) => {
  // Remover caracteres no numéricos
  const value = event.target.value.replace(/\D/g, "");
  // Limitar a 5 caracteres
  form.value.addressNumber = value.slice(0, 5);
};

const handleSubmit = async (values) => {
  adStore.updateEmail(values.email);
  adStore.updatePhone(values.phone);
  adStore.updateRegion(values.region);
  adStore.updateCommune(values.commune);
  adStore.updateAddress(values.address);
  adStore.updateAddressNumber(values.addressNumber.toString());

  emit("formSubmitted", values);
};

const handleformBack = async () => {
  emit("formBack");
};

onMounted(() => {
  regionsStore.loadRegions();
  communesStore.loadCommunes();
});
</script>
