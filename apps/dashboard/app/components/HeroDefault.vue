<template>
  <section class="hero hero--default">
    <div class="hero--default__container">
      <div class="hero--default__header">
        <div class="hero--default__content">
          <div class="hero--default__breadcrumbs">
            <BreadcrumbsDefault :items="breadcrumbs" />
          </div>
          <div class="hero--default__title">
            <h1 class="title">
              <span v-if="$slots.titlePrefix" class="hero--default__title-icon">
                <slot name="titlePrefix" />
              </span>
              <span>{{ title }}</span>
            </h1>
          </div>
        </div>
        <div v-if="$slots.actions" class="hero--default__actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BreadcrumbsDefault from "@/components/BreadcrumbsDefault.vue";

const props = defineProps<{
  title: string;
  breadcrumbs?: Array<{
    label: string;
    to?: string;
  }>;
}>();

const breadcrumbs = computed(() => props.breadcrumbs || []);
</script>

<style scoped>
.hero--default__title .title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero--default__title-icon {
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.hero--default__title-icon :deep(svg) {
  width: 24px;
  height: 24px;
}
</style>
