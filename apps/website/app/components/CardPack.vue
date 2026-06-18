<template>
  <article
    class="card card--pack"
    :class="{ 'card--pack--recommended': pack.recommended }"
  >
    <span v-if="pack.recommended" class="card--pack__badge">
      <IconStar :size="14" class="card--pack__badge__icon" />
      Recomendado
    </span>

    <div class="card--pack__head">
      <span class="card--pack__head__name">{{ pack.name }}</span>
      <span v-if="badgeText" class="card--pack__head__chip">{{
        badgeText
      }}</span>
    </div>

    <div class="card--pack__count">
      <span class="card--pack__count__value">{{ pack.total_ads }}</span>
      <span class="card--pack__count__label">avisos</span>
    </div>

    <ul class="card--pack__features">
      <li
        v-for="(feature, index) in features"
        :key="index"
        class="card--pack__features__item"
      >
        <IconCheck :size="18" class="card--pack__features__item__icon" />
        {{ feature }}
      </li>
    </ul>

    <button
      type="button"
      class="card--pack__cta"
      :class="{ 'card--pack__cta--outline': !pack.recommended }"
      title="Comprar pack"
      @click="buyPack(pack.id)"
    >
      Comprar pack
    </button>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Check as IconCheck, Star as IconStar } from "lucide-vue-next";
import type { Pack } from "@/types/pack";
import { useAdStore } from "@/stores/ad.store";

const props = defineProps<{
  pack: Pack;
  allPacks: Pack[];
}>();

const router = useRouter();
const adStore = useAdStore();
const { getPackBadgeText, getPackDescription } = usePacks();

const buyPack = async (packId: number) => {
  if (import.meta.client) {
    adStore.updatePack(packId);
    router.push("/pagar");
  }
};

const badgeText = computed(() => getPackBadgeText(props.pack, props.allPacks));

// The pack description helper returns a multi-line string; render every line
// except the trailing "Ahorras un X%" (shown as the head chip) as a check row.
const features = computed(() => {
  return getPackDescription(props.pack, props.allPacks)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("Ahorras un"));
});
</script>
