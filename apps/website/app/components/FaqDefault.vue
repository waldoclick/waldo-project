<template>
  <section id="preguntas-frecuentes" class="faq faq--default">
    <div
      v-if="displayedFaqItems && displayedFaqItems.length > 0"
      class="faq--default__container"
    >
      <component
        :is="titleTag"
        v-if="title"
        class="faq--default__title title"
        :class="{ 'faq--default__title--left': isLeft }"
      >
        <span>{{ title }}</span>
      </component>
      <div
        v-if="text"
        class="faq--default__paragraph paragraph"
        :class="{ 'faq--default__paragraph--left': isLeft }"
      >
        <span>{{ text }}</span>
      </div>
      <div class="faq--default__accordion">
        <div class="faq--default__accordion__wrapper">
          <AccordionDefault
            :questions="displayedFaqItems"
            :title-tag="accordionTitleTag"
          />
        </div>
      </div>
      <div v-if="shouldShowButton" class="faq--default__button">
        <nuxt-link
          to="/preguntas-frecuentes"
          class="btn btn--primary btn--announcement"
          title="Ver todas las preguntas"
        >
          <span>Ver todas las preguntas</span>
        </nuxt-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { FAQ } from "@/types/faq";
import AccordionDefault from "@/components/AccordionDefault.vue";

const props = defineProps<{
  title?: string;
  text?: string;
  limit?: number;
  faqs: FAQ[];
  isLeft?: boolean;
  titleTag?: "h1" | "h2";
}>();

const title = props.title ?? "Preguntas Frecuentes";
const limit = props.limit ?? null;
const titleTag = props.titleTag ?? "h2";

const accordionTitleTag = computed<"h2" | "h3">(() => {
  return "h3";
});

const displayedFaqItems = computed(() => {
  if (limit && props.faqs && props.faqs.length > 0) {
    return props.faqs.slice(0, limit);
  }
  return props.faqs;
});

const shouldShowButton = computed(() => {
  return limit && props.faqs && props.faqs.length >= limit;
});
</script>
