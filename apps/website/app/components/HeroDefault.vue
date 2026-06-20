<template>
  <section class="hero hero--default" :style="bgStyle">
    <span class="hero--default__glow" aria-hidden="true"></span>
    <div class="hero--default__inner">
      <nav
        v-if="breadcrumbs && breadcrumbs.length > 0"
        class="hero--default__crumbs"
        aria-label="Ruta de navegación"
      >
        <NuxtLink to="/" class="hero--default__crumbs__home">Waldo</NuxtLink>
        <template v-for="(crumb, index) in breadcrumbs" :key="index">
          <ChevronRight class="hero--default__crumbs__sep" aria-hidden="true" />
          <NuxtLink
            v-if="crumb.to"
            :to="crumb.to"
            class="hero--default__crumbs__link"
            >{{ crumb.label }}</NuxtLink
          >
          <span v-else class="hero--default__crumbs__current">{{
            crumb.label
          }}</span>
        </template>
      </nav>

      <slot name="eyebrow" />

      <div class="hero--default__row">
        <div class="hero--default__head">
          <span
            v-if="titleIcon"
            class="hero--default__head__icon"
            :style="titleIconBg ? { backgroundColor: titleIconBg } : {}"
          >
            <component :is="titleIcon" :size="26" />
          </span>
          <h1 class="hero--default__title">
            <slot name="title">{{ title }}</slot>
          </h1>
        </div>
        <div v-if="$slots.actions" class="hero--default__actions">
          <slot name="actions" />
        </div>
      </div>

      <p v-if="subtitle" class="hero--default__subtitle">{{ subtitle }}</p>

      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Component } from "vue";
import { ChevronRight } from "lucide-vue-next";

const props = defineProps<{
  /** Breadcrumb trail rendered after a leading "Waldo" home link. */
  breadcrumbs?: { label: string; to?: string }[];
  /** Heading text. Override with the `title` slot for rich markup. */
  title?: string;
  /** Intro paragraph under the title. */
  subtitle?: string;
  /** Optional Lucide icon component rendered before the title. */
  titleIcon?: Component;
  /** Background color for the title icon box (e.g. category color). */
  titleIconBg?: string;
  /** Override the cream background (e.g. category color on /anuncios). */
  bgColor?: string;
}>();

const bgStyle = computed(() =>
  props.bgColor ? { backgroundColor: props.bgColor } : {},
);
</script>
