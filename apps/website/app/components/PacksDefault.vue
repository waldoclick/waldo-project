<template>
  <section id="comprar-packs" class="packs packs--default">
    <div class="packs--default__container">
      <div v-if="showHead" class="packs--default__head">
        <h2 class="packs--default__head__title">Publica más, paga menos</h2>
        <p class="packs--default__head__text">
          Hasta un
          <span class="packs--default__head__text__highlight"
            >{{ maxSavings }}% de ahorro</span
          >
          frente al precio por anuncio individual. Avisos para usar cuando
          quieras.
        </p>
      </div>
      <div class="packs--default__list">
        <client-only>
          <CardPack
            v-for="(item, index) in displayPacks"
            :key="index"
            :pack="item"
            :all-packs="packs"
          />
        </client-only>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Pack } from "@/types/pack";
import CardPack from "@/components/CardPack.vue";

const props = defineProps<{
  packs: Pack[];
  showHead?: boolean;
}>();

const showHead = computed(() => props.showHead ?? false);
const { getMaxSavingsPct } = usePacks();

// Display only the 3 intended packs: filter out single-ad pack (total_ads <= 1)
// then deduplicate by total_ads (DB has duplicate 60-ads records), keeping first occurrence.
// Result: 15 / 30 / 60 avisos — exactly 3 cards.
const displayPacks = computed(() => {
  const seen = new Set<number>();
  return props.packs.filter((item) => {
    if (item.total_ads <= 1) return false;
    if (seen.has(item.total_ads)) return false;
    seen.add(item.total_ads);
    return true;
  });
});

const maxSavings = computed(() => getMaxSavingsPct(props.packs) ?? 98);
</script>
