<template>
  <article class="card card--highlight">
    <div class="card--highlight__icon">
      <component
        :is="icon"
        :size="24"
        class="icon-highlight"
        fill="$light_peach"
      />
    </div>
    <div class="card--highlight__info">
      <div class="card--highlight__info__title" v-html="sanitizedTitle" />
      <div class="card--highlight__info__text" v-html="sanitizedDescription" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSanitize } from "@/composables/useSanitize";

// Define las propiedades del componente
const props = defineProps<{
  icon: any;
  title: string;
  description: string;
}>();

// Composable para sanitización
const { sanitizeText } = useSanitize();

// Computed properties para sanitizar el contenido
const sanitizedTitle = computed(() => sanitizeText(props.title));
const sanitizedDescription = computed(() => sanitizeText(props.description));
</script>

<script lang="ts">
export default {
  name: "CardHighlight",
};
</script>
