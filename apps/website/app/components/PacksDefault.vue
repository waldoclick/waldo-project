<template>
  <section id="comprar-packs" class="packs packs--default" :class="isSeparator">
    <div class="packs--default__container">
      <h2 v-if="title" class="packs--default__title title">{{ title }}</h2>
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
  separator?: boolean;
  packs: Pack[];
}>();

const separator = props.separator ?? false;
const { getPacksPageTitle } = usePacks();

// Plain text (no markup) — rendered via interpolation, which Vue auto-escapes.
const title = computed(() => getPacksPageTitle(props.packs));

const isSeparator = computed(() => {
  return separator ? "is-separator" : "";
});
</script>
