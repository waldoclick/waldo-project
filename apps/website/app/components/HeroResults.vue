<template>
  <section ref="heroElement" class="hero hero--results">
    <div class="hero--results__container">
      <div class="hero--results__breadcrumbs">
        <BreadcrumbsDefault :items="breadcrumbItems" />
      </div>

      <div class="hero--results__title">
        <div class="title title--category">
          <div v-if="category" class="title--category__icon">
            <component :is="categoryIcon" :size="24" class="icon-category" />
          </div>
          <h1 class="title--category__text title">
            {{ title }}
          </h1>
        </div>
      </div>

      <div v-if="queryValue" class="hero--results__query">
        Resultados para: <b>{{ queryValue }}</b>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useRuntimeConfig } from "#app";
import BreadcrumbsDefault from "@/components/BreadcrumbsDefault.vue";
import { useIcons } from "../composables/useIcons";
import { useColor } from "../composables/useColor";

// Accede a la configuración de runtime
const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;
const { hexToRgba, bgColorWithTransparency } = useColor();

// Props
const props = defineProps<{
  bgColor: string;
  title: string;
  icon?: string;
  color?: string;
}>();

// Obtener el valor de s desde la URL
const route = useRoute();
const queryValue = computed(() => route.query.s?.toString() || "");
const category = computed(() => route.query.category?.toString() || "");

const { getCategoryIcon } = useIcons();

const categoryIcon = computed(() => {
  return getCategoryIcon(category.value);
});

// Referencia al elemento hero
const heroElement = ref(null);

// Establecer variables CSS iniciales
onMounted(() => {
  if (heroElement.value && heroElement.value.style) {
    heroElement.value.style.setProperty(
      "--hero-bg-color",
      bgColorWithTransparency(props.bgColor || "#f0f0f0"),
    );
    heroElement.value.style.setProperty(
      "--category-icon-bg-color",
      props.color || "transparent",
    );
  }
});

// Computed para los items del breadcrumb
const breadcrumbItems = computed(() => {
  const items = [{ label: "Anuncios", to: "/anuncios" }];
  if (category.value) {
    const categoryLabel =
      category.value.charAt(0).toUpperCase() + category.value.slice(1);
    items.push({ label: categoryLabel, to: "" });
  }
  return items;
});

// Watch para actualizar estilos cuando cambien las props
watch(
  () => props.bgColor,
  (newColor, oldColor) => {
    // Solo actualizar si el color realmente cambió
    if (newColor && newColor !== oldColor) {
      nextTick(() => {
        if (heroElement.value) {
          heroElement.value.style.setProperty(
            "--hero-bg-color",
            bgColorWithTransparency(newColor),
          );
          heroElement.value.style.setProperty(
            "--category-icon-bg-color",
            newColor,
          );
        }
      });
    }
  },
  { immediate: true },
);
</script>
