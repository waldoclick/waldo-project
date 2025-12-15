<template>
  <div class="accordion" role="region" aria-label="Acordeón de preguntas">
    <div
      v-for="(item, index) in formattedQuestions"
      :key="index"
      class="accordion--item"
    >
      <button
        :id="`accordion-header-${index}`"
        class="accordion--item__head"
        :aria-expanded="isActive(index) ? 'true' : 'false'"
        :aria-controls="`accordion-panel-${index}`"
        type="button"
        @click="toggleItem(index)"
        @keydown.enter.prevent="toggleItem(index)"
        @keydown.space.prevent="toggleItem(index)"
      >
        <component :is="titleTag">{{ item.title }}</component>
        <IconChevronDown
          :class="{ rotated: isActive(index) }"
          aria-hidden="true"
          :size="20"
        />
      </button>
      <Transition name="accordion">
        <div
          v-if="isActive(index)"
          :id="`accordion-panel-${index}`"
          class="accordion--item__body"
          :class="{ 'no-animation': isFirstLoad && index === 0 }"
          role="region"
          :aria-labelledby="`accordion-header-${index}`"
          v-html="item.text"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { ChevronDown as IconChevronDown } from "lucide-vue-next";
import { useSanitize } from "@/composables/useSanitize";

// Define las propiedades del componente
const props = defineProps<{
  questions: Array<{ title: string; text: string }>;
  titleTag?: "h2" | "h3";
}>();

// Estado reactivo para el índice activo
const activeIndex = ref<number | null>(null);
const isFirstLoad = ref(true);
const titleTag = props.titleTag ?? "h2";

// Composable para sanitización
const { sanitizeRich } = useSanitize();

const formattedQuestions = computed(() => {
  return props.questions.map((question) => ({
    ...question,
    text: sanitizeRich(
      question.text.replace(/Waldo\.click®/g, "<strong>Waldo.click®</strong>")
    ),
  }));
});

// Inicializar con el primer elemento abierto
onMounted(() => {
  // Verificar si hay elementos antes de establecer el valor
  if (props.questions && props.questions.length > 0) {
    activeIndex.value = 0;
  }
});

// Método para alternar el índice activo
const toggleItem = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
  isFirstLoad.value = false;
};

// Método para verificar si un índice está activo
const isActive = (index: number) => {
  return activeIndex.value === index;
};
</script>

<style scoped>
.accordion--item__body.no-animation {
  transition: none !important;
}
</style>
