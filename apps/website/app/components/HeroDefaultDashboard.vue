<template>
  <section class="hero hero--dashboard">
    <div class="hero--dashboard__container">
      <div class="hero--dashboard__header">
        <div class="hero--dashboard__content">
          <div class="hero--dashboard__breadcrumbs">
            <BreadcrumbsDefaultDashboard :items="breadcrumbs" />
          </div>
          <div class="hero--dashboard__title">
            <h1 class="title">
              <span v-if="$slots.titlePrefix" class="hero--dashboard__title-icon">
                <slot name="titlePrefix" />
              </span>
              <span>{{ title }}</span>
            </h1>
          </div>
        </div>
        <div v-if="$slots.actions" class="hero--dashboard__actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

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
.hero--dashboard__title .title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero--dashboard__title-icon {
  display: inline-flex;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.hero--dashboard__title-icon :deep(svg) {
  width: 24px;
  height: 24px;
}
</style>
