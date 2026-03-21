<template>
  <Form v-slot="{ meta }" class="form form--pro" @submit="handleSubmit">
    <!-- Header -->
    <div class="form--pro__header">
      <h2 class="form--pro__header__title">Confirma tu suscripcion PRO</h2>
      <div class="form--pro__header__description">
        <p>
          Por solo $1.000 mensuales, accede a funciones exclusivas y destaca tu
          perfil con una cuenta PRO.
        </p>
      </div>
    </div>

    <!-- Boleta o factura -->
    <div class="form--pro__field">
      <button
        type="button"
        class="form--pro__field__toggle"
        @click="toggle('invoice')"
      >
        <div class="form--pro__field__toggle__left">
          <h3 class="form--pro__field__title">Boleta o factura</h3>
          <span class="form--pro__field__summary">{{ invoiceSummary }}</span>
        </div>
        <ChevronDownIcon
          :size="20"
          :class="[
            'form--pro__field__chevron',
            { 'form--pro__field__chevron--open': open.invoice },
          ]"
        />
      </button>
      <div v-show="open.invoice" class="form--pro__field__content">
        <PaymentProInvoice
          v-model="isInvoice"
          @update:model-value="handleIsInvoiceUpdate"
        />
      </div>
    </div>

    <!-- Pasarela de pago -->
    <div class="form--pro__field">
      <button
        type="button"
        class="form--pro__field__toggle"
        @click="toggle('gateway')"
      >
        <div class="form--pro__field__toggle__left">
          <h3 class="form--pro__field__title">Pasarela de pago</h3>
          <span class="form--pro__field__summary">Oneclick</span>
        </div>
        <ChevronDownIcon
          :size="20"
          :class="[
            'form--pro__field__chevron',
            { 'form--pro__field__chevron--open': open.gateway },
          ]"
        />
      </button>
      <div v-show="open.gateway" class="form--pro__field__content">
        <PaymentProGateway />
      </div>
    </div>

    <BarPro primary-label="Ir a pagar" :show-back="false" :show-steps="false" />
  </Form>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { Form } from "vee-validate";
import { ChevronDownIcon } from "lucide-vue-next";

const emit = defineEmits(["formSubmitted", "update:isInvoice"]);
const isInvoice = ref(false);

const open = reactive({
  invoice: true, // open by default per D-02
  gateway: false,
});

const toggle = (key: keyof typeof open) => {
  open[key] = !open[key];
};

const invoiceSummary = computed(() => (isInvoice.value ? "Factura" : "Boleta"));

const handleIsInvoiceUpdate = (val: boolean) => {
  isInvoice.value = val;
  emit("update:isInvoice", val);
};

const handleSubmit = (values: Record<string, unknown>) => {
  emit("formSubmitted", values);
};
</script>
