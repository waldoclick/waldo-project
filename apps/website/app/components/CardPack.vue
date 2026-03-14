<template>
  <article
    class="card card--pack"
    :class="pack.recommended ? 'recommended' : ''"
  >
    <div class="card--pack__price">
      <span v-if="badgeText" class="saving">{{ badgeText }}</span>
      <span v-else class="saving">No hay oferta</span>
      <span class="price"
        >{{ pack.quantity }} x {{ formatPrice(pack.price) }}</span
      >
    </div>
    <div v-if="descriptionText" class="card--pack__description">
      <span v-html="descriptionText"></span>
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

const props = defineProps<{
  pack: Pack;
  allPacks: Pack[];
}>();

const router = useRouter();
const adStore = useAdStore();
const { sanitizeText } = useSanitize();
const { getPackBadgeText, getPackDescription } = usePacks();

const buyPack = async (packId: number) => {
  if (import.meta.client) {
    adStore.updatePack(packId);
    router.push("/pagar");
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(price);
};

const badgeText = computed(() => getPackBadgeText(props.pack, props.allPacks));

const descriptionText = computed(() => {
  const lines = getPackDescription(props.pack, props.allPacks).split("\n");
  if (lines.length > 0) {
    lines[0] = `<strong>${lines[0]}</strong>`;
  }
  return sanitizeText(lines.join("<br>"));
});
</script>
