<template>
  <section ref="heroElement" class="hero hero--announcement">
    <div class="hero--announcement__container">
      <div class="hero--announcement__content">
        <nav class="hero--announcement__breadcrumbs">
          <nuxt-link class="hero--announcement__breadcrumbs__link" to="/">
            Waldo
          </nuxt-link>
          <ChevronRight
            class="hero--announcement__breadcrumbs__sep"
            :size="14"
          />
          <nuxt-link
            class="hero--announcement__breadcrumbs__link"
            to="/anuncios"
          >
            Anuncios
          </nuxt-link>
          <ChevronRight
            class="hero--announcement__breadcrumbs__sep"
            :size="14"
          />
          <nuxt-link
            class="hero--announcement__breadcrumbs__link"
            :to="`/anuncios?category=${getCategory.slug}`"
          >
            {{ getCategory.name }}
          </nuxt-link>
          <ChevronRight
            class="hero--announcement__breadcrumbs__sep"
            :size="14"
          />
          <span class="hero--announcement__breadcrumbs__current">
            {{ getTitle }}
          </span>
        </nav>

        <h1 class="hero--announcement__title">
          {{ getTitle }}
        </h1>

        <div class="hero--announcement__meta">
          <span
            v-if="getCategory.name"
            class="hero--announcement__meta__pill"
            :style="{ backgroundColor: pillBg, color: pillTextColor }"
          >
            <span
              class="hero--announcement__meta__pill__dot"
              :style="{ backgroundColor: dotBg }"
            />
            {{ getCategory.name }}
          </span>
          <span v-if="publishedLabel" class="hero--announcement__meta__item">
            <Clock class="hero--announcement__meta__item__icon" :size="15" />
            Publicado {{ publishedLabel }}
          </span>
          <span v-if="views > 0" class="hero--announcement__meta__item">
            <Eye class="hero--announcement__meta__item__icon" :size="15" />
            {{ views }} vistas
          </span>
        </div>
      </div>

      <nuxt-link to="/anuncios" class="hero--announcement__back">
        <ArrowLeft class="hero--announcement__back__icon" :size="16" />
        Volver a resultados
      </nuxt-link>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted, watch } from "vue";
import { ChevronRight, Clock, ArrowLeft, Eye } from "lucide-vue-next";
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: Object,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
  published: {
    type: String,
    default: "",
  },
  views: {
    type: Number,
    default: 0,
  },
});

const getTitle = computed(() => props.name);
const getCategory = computed(() => props.category);

const categoryColor = computed(() => getCategory.value?.color || "#8a8794");
const heroBg = computed(
  () => `color-mix(in srgb, ${categoryColor.value} 10%, white)`,
);
const pillBg = computed(
  () => `color-mix(in srgb, ${categoryColor.value} 14%, white)`,
);
const pillTextColor = computed(
  () => `color-mix(in srgb, ${categoryColor.value} 65%, #26252B)`,
);
const dotBg = computed(
  () => `color-mix(in srgb, ${categoryColor.value} 65%, #26252B)`,
);

const publishedLabel = computed(() => {
  if (!props.published) return "";
  const date = new Date(props.published);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

// Referencia al elemento hero
const heroElement = ref(null);

// Función para actualizar el color de fondo
const updateBackgroundColor = () => {
  if (heroElement.value) {
    heroElement.value.style.setProperty("background-color", heroBg.value);
  }
};

// Watch para actualizar cuando cambie la categoría
watch(() => getCategory.value?.color, updateBackgroundColor, {
  immediate: true,
});

// onMounted: UI-only — applies category background color CSS after initial DOM paint (watch handles reactive updates)
onMounted(updateBackgroundColor);
</script>
