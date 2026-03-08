<template>
  <article
    class="card card--pack"
    :class="pack.recommended ? 'recommended' : ''"
  >
    <div class="card--pack__price">
      <span v-if="pack.text" class="saving">{{ pack.text }}</span>
      <span v-else class="saving">No hay oferta</span>
      <span class="price"
        >{{ pack.quantity }} x {{ formatPrice(pack.price) }}</span
      >
    </div>
    <div v-if="pack.description" class="card--pack__description">
      <span v-html="formattedDescription"></span>
    </div>
    <div class="card--pack__link">
      <button
        type="button"
        class="btn btn--buy"
        title="Comprar"
        @click="buyPack(pack.id)"
      >
        Comprar
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import type { Pack } from "@/types/pack";
import { useAdStore } from "@/stores/ad.store";
import { useSanitize } from "@/composables/useSanitize";

// Define las propiedades del componente
const props = defineProps<{
  pack: Pack;
}>();

const router = useRouter();
const adStore = useAdStore();
const { sanitizeText } = useSanitize();

// Método para comprar el pack
const buyPack = async (packId: number) => {
  if (import.meta.client) {
    adStore.updatePack(packId);
    router.push("/pagar");
  }
};

// Método para formatear el precio
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(price);
};

// Formatear la descripción para que la primera línea sea en negrita
const formattedDescription = computed(() => {
  if (!props.pack.description) return "";
  const lines = props.pack.description.split("\n");
  if (lines.length > 0) {
    lines[0] = `<strong>${lines[0]}</strong>`;
  }
  return sanitizeText(lines.join("<br>"));
});
</script>
