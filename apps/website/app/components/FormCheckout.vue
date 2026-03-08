<template>
  <Form v-slot="{ meta }" class="form form--checkout" @submit="handleSubmit">
    <!-- Introduce -->
    <div class="form--checkout__header">
      <h2 class="form--checkout__header__title">Confirma tu pago</h2>
      <div class="form--checkout__header__description">
        <p>
          Revisa los detalles de tu anuncio, elige cómo quieres publicarlo y
          completa el pago de forma segura.
        </p>
      </div>
    </div>

    <!-- Anuncio (siempre visible, sin accordion) -->
    <div class="form--checkout__ad">
      <h3 class="form--checkout__ad__title">Tu anuncio</h3>
      <PaymentAd />
    </div>

    <!-- Destacado -->
    <div class="form--checkout__field">
      <button
        type="button"
        class="form--checkout__field__toggle"
        @click="toggle('featured')"
      >
        <div class="form--checkout__field__toggle__left">
          <h3 class="form--checkout__field__title">Destacado</h3>
          <span class="form--checkout__field__summary">{{
            featuredSummary
          }}</span>
        </div>
        <ChevronDownIcon
          :size="20"
          :class="[
            'form--checkout__field__chevron',
            { 'form--checkout__field__chevron--open': open.featured },
          ]"
        />
      </button>
      <div v-show="open.featured" class="form--checkout__field__content">
        <PaymentFeatured />
      </div>
    </div>

    <!-- Tipo de publicación -->
    <div class="form--checkout__field">
      <button
        type="button"
        class="form--checkout__field__toggle"
        @click="toggle('method')"
      >
        <div class="form--checkout__field__toggle__left">
          <h3 class="form--checkout__field__title">Tipo de publicación</h3>
          <span class="form--checkout__field__summary">{{
            methodSummary
          }}</span>
        </div>
        <ChevronDownIcon
          :size="20"
          :class="[
            'form--checkout__field__chevron',
            { 'form--checkout__field__chevron--open': open.method },
          ]"
        />
      </button>
      <div v-show="open.method" class="form--checkout__field__content">
        <PaymentMethod :hide-free="true" />
      </div>
    </div>

    <!-- Boleta o factura -->
    <div class="form--checkout__field">
      <button
        type="button"
        class="form--checkout__field__toggle"
        @click="toggle('invoice')"
      >
        <div class="form--checkout__field__toggle__left">
          <h3 class="form--checkout__field__title">Boleta o factura</h3>
          <span class="form--checkout__field__summary">{{
            invoiceSummary
          }}</span>
        </div>
        <ChevronDownIcon
          :size="20"
          :class="[
            'form--checkout__field__chevron',
            { 'form--checkout__field__chevron--open': open.invoice },
          ]"
        />
      </button>
      <div v-show="open.invoice" class="form--checkout__field__content">
        <PaymentInvoice />
      </div>
    </div>

    <!-- Pasarela de pago -->
    <div class="form--checkout__field">
      <button
        type="button"
        class="form--checkout__field__toggle"
        @click="toggle('gateway')"
      >
        <div class="form--checkout__field__toggle__left">
          <h3 class="form--checkout__field__title">Pasarela de pago</h3>
          <span class="form--checkout__field__summary">WebPay</span>
        </div>
        <ChevronDownIcon
          :size="20"
          :class="[
            'form--checkout__field__chevron',
            { 'form--checkout__field__chevron--open': open.gateway },
          ]"
        />
      </button>
      <div v-show="open.gateway" class="form--checkout__field__content">
        <PaymentGateway />
      </div>
    </div>

    <BarCheckout
      :percentage="100"
      :current-step="1"
      :total-steps="5"
      :show-steps="true"
      :summary-text="paymentSummaryText"
      primary-label="Ir a pagar"
      :primary-disabled="!meta.valid"
      :show-back="true"
      @back="handleBack"
    />
  </Form>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { Form } from "vee-validate";
import { ChevronDownIcon } from "lucide-vue-next";
import { useAdStore } from "@/stores/ad.store";
import { useAdPaymentSummary } from "@/composables/useAdPaymentSummary";

const emit = defineEmits(["formSubmitted"]);
const adStore = useAdStore();
const router = useRouter();
const { paymentSummaryText, packPart } = useAdPaymentSummary();

const isPackFlow = adStore.ad.ad_id === null;

const open = reactive({
  method: isPackFlow,
  featured: false,
  invoice: false,
  gateway: false,
});

const toggle = (key: keyof typeof open) => {
  open[key] = !open[key];
};

const methodSummary = computed(() => packPart.value?.label || "—");

const featuredSummary = computed(() => {
  if (adStore.featured === "free") return "Destacado gratuito";
  if (adStore.featured === true) return "Destacado por $10.000";
  return "No destacar";
});

const invoiceSummary = computed(() =>
  adStore.is_invoice ? "Factura" : "Boleta",
);

const handleBack = () => {
  router.push(isPackFlow ? "/packs" : "/anunciar/resumen");
};

const handleSubmit = (values: Record<string, unknown>) => {
  emit("formSubmitted", values);
};
</script>
