<template>
  <div class="payment payment--pro-invoice">
    <div class="payment--pro-invoice__title">¿Necesitas boleta o factura?</div>
    <div v-if="!user?.is_company" class="payment--pro-invoice__description">
      <strong>Importante:</strong> Si necesitas factura, asegúrate de tener un
      perfil de empresa.
      <NuxtLink to="/cuenta/perfil/editar">Edita tu perfil aquí</NuxtLink>.
    </div>
    <div v-else-if="!canRequestInvoice" class="payment--pro-invoice__description">
      <strong>Importante:</strong> Para solicitar factura, debes completar todos
      los datos de tu empresa.
      <NuxtLink to="/cuenta/perfil/editar">Completa tu perfil aquí</NuxtLink>.
    </div>
    <div class="payment--pro-invoice__options">
      <label class="payment--pro-invoice__options__item">
        <input
          v-model="isInvoice"
          type="radio"
          name="pro-invoice"
          :value="false"
          @change="updateInvoice"
        />
        <span>Boleta</span>
      </label>
      <label
        class="payment--pro-invoice__options__item"
        :class="{
          'payment--pro-invoice__options__item--disabled': !canRequestInvoice,
        }"
      >
        <input
          v-model="isInvoice"
          type="radio"
          name="pro-invoice"
          :value="true"
          :disabled="!canRequestInvoice"
          @change="updateInvoice"
        />
        <span>Factura</span>
      </label>
    </div>
    <div
      v-if="isInvoice && canRequestInvoice"
      class="payment--pro-invoice__details"
    >
      La factura se emitirá a <strong>{{ user?.business_name }}</strong
      >, RUT <strong>{{ user?.business_rut }}</strong
      >, con giro en <strong>{{ user?.business_type }}</strong
      >. Dirección de facturación:
      <strong
        >{{ user?.business_address }} {{ user?.business_address_number }},
        {{ user?.business_commune?.name }},
        {{ user?.business_commune?.region?.name }}</strong
      >.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUser } from "@/composables/useUser";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ (e: "update:modelValue", value: boolean): void }>();

const user = useStrapiUser();
const { canRequestInvoice } = useUser(user.value);
const isInvoice = ref(props.modelValue);

const updateInvoice = () => {
  if (!canRequestInvoice.value) {
    isInvoice.value = false;
  }
  emit("update:modelValue", isInvoice.value);
};
</script>
