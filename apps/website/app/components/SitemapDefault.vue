<template>
  <div class="sitemap sitemap--default">
    <div
      v-for="(block, index) in blocks"
      :key="index"
      class="sitemap--default__block"
    >
      <span class="sitemap--default__block__title">
        <span
          class="sitemap--default__block__title__dot"
          aria-hidden="true"
        ></span>
        {{ block.title }}
      </span>
      <div class="sitemap--default__block__list">
        <nuxt-link
          v-for="(item, itemIndex) in block.items"
          :key="itemIndex"
          :to="item.to"
          class="sitemap--default__block__list__row"
        >
          <span class="sitemap--default__block__list__row__label">{{
            item.label
          }}</span>
          <ChevronRight
            class="sitemap--default__block__list__row__chevron"
            aria-hidden="true"
          />
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from "lucide-vue-next";

interface SitemapItem {
  to: string;
  label: string;
}

interface SitemapBlock {
  title: string;
  items: SitemapItem[];
}

defineProps<{
  blocks: SitemapBlock[];
}>();
</script>
