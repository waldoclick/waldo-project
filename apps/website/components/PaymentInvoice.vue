<template>
  <div v-if="shouldShowInvoice" class="payment payment--invoice">
    <div class="payment--invoice__title">¿Necesitas boleta o factura?</div>
    <div v-if="!user.is_company" class="payment--invoice__description">
      <strong>Importante:</strong> Si necesitas factura, asegúrate de tener un
      perfil de empresa.
      <NuxtLink to="/cuenta/perfil/editar">Edita tu perfil aquí</NuxtLink>.
    </div>
    <div v-else-if="!canRequestInvoice" class="payment--invoice__description">
      <strong>Importante:</strong> Para solicitar factura, debes completar todos
      los datos de tu empresa.
      <NuxtLink to="/cuenta/perfil/editar">Completa tu perfil aquí</NuxtLink>.
    </div>
    <div class="payment--invoice__options">
      <label class="payment--invoice__options__item">
        <input
          v-model="isInvoice"
          type="radio"
          name="invoice"
          :value="false"
          @change="updateInvoice"
        />
        <span>Boleta</span>
      </label>
      <label
        class="payment--invoice__options__item"
        :class="{
          'payment--invoice__options__item--disabled': !canRequestInvoice,
        }"
      >
        <input
          v-model="isInvoice"
          type="radio"
          name="invoice"
          :value="true"
          :disabled="!canRequestInvoice"
          @change="updateInvoice"
        />
        <span>Factura</span>
      </label>
    </div>
    <div
      v-if="isInvoice && canRequestInvoice"
      class="payment--invoice__details"
    >
      La factura se emitirá a <strong>{{ user.business_name }}</strong
      >, RUT <strong>{{ user.business_rut }}</strong
      >, con giro en <strong>{{ user.business_type }}</strong
      >. Dirección de facturación:
      <strong
        >{{ user.business_address }} {{ user.business_address_number }},
        {{ user.business_commune?.name }},
        {{ user.business_commune?.region?.name }}</strong
      >.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAdStore } from "@/stores/ad.store";
import { useUser } from "@/composables/useUser";

const user = useStrapiUser();
const { canRequestInvoice } = useUser(user.value);

const adStore = useAdStore();
const isInvoice = ref(false); // Por defecto, boleta (false)

// Computed property to determine if the invoice section should be shown
const shouldShowInvoice = computed(() => {
  return adStore.featured === true || typeof adStore.pack === "number";
});

// Obtener el valor inicial del store cuando el componente se monta
onMounted(() => {
  isInvoice.value = adStore.is_invoice;

  // Si el usuario no puede solicitar factura, forzar boleta
  if (!canRequestInvoice.value) {
    isInvoice.value = false;
    adStore.is_invoice = false;
  }
});

// Función para actualizar el estado de is_invoice en el store
const updateInvoice = () => {
  if (!canRequestInvoice.value) {
    isInvoice.value = false;
  }
  adStore.is_invoice = isInvoice.value;
};
</script>
