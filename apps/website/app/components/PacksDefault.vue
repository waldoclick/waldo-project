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
          <template v-for="(item, index) in packs" :key="index">
            <CardPack
              v-if="item.total_ads > 1"
              :pack="item"
              :all-packs="packs"
            />
          </template>
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

const maxSavings = computed(() => getMaxSavingsPct(props.packs) ?? 98);
</script>
