<template>
  <NuxtLink :to="generateUrl" class="card card--category">
    <div ref="root" class="card--category__inner">
      <span class="card--category__icon">
        <component :is="getIcon" :size="24" class="icon-category" />
      </span>
      <span class="card--category__info">
        <h3 class="card--category__info__name" v-html="sanitizedTitle"></h3>
        <span class="card--category__info__count">
          {{ countText }}
          <component :is="icons.ChevronRight" :size="16" class="icon-chevron" />
        </span>
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useIcons } from "../composables/useIcons";
import { useSanitize } from "@/composables/useSanitize";

const props = defineProps<{
  title?: string;
  slug?: string | number;
  count?: string | number;
  icon?: string;
  color?: string;
}>();

const root = ref<HTMLElement | null>(null);

const { icons, getCategoryIcon } = useIcons();
const { sanitizeText } = useSanitize();

const getIcon = computed(() => {
  const title = props.title?.toLowerCase() || "";
  const slug = String(props.slug).toLowerCase();
  return getCategoryIcon(slug) || getCategoryIcon(title);
});

const generateUrl = computed(() => ({
  path: "/anuncios",
  query: { category: props.slug },
}));

const sanitizedTitle = computed(() => sanitizeText(props.title || ""));

const countText = computed(() => {
  const count = Number(props.count);
  if (!props.count || count <= 0) return "Ver anuncios";
  if (count === 1) return "1 anuncio";
  if (count > 99) return "+99 anuncios";
  return `${count} anuncios`;
});

// Aplica color solo en el elemento real
function applyColor(color?: string) {
  if (!root.value) return;
  if (color) root.value.style.setProperty("--category-bg-color", color);
  else root.value.style.removeProperty("--category-bg-color");
}

onMounted(async () => {
  await nextTick();
  applyColor(props.color);
});

watch(
  () => props.color,
  (newColor) => applyColor(newColor),
);
</script>

<!-- <style scoped>
.card--category {
  background-color: var(--category-bg-color, transparent);
  transition: background-color 0.25s ease;
}
</style> -->
