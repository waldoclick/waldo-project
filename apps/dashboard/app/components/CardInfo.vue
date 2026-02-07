<template>
  <article class="card card--info">
    <div class="card--info__title">
      {{ title }}
    </div>
    <div v-if="description" class="card--info__description">
      <client-only>
        <button v-if="info" v-tooltip="info">
          <IconInfo size="18" />
        </button>
      </client-only>
      <template v-if="link">
        <a
          :class="[
            'card--info__description__text',
            { 'card--info__description__text--truncate': truncateText },
          ]"
          :href="link"
          :title="description"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span
            v-if="isColorValue"
            class="card--info__description__color"
            :style="{ backgroundColor: String(description) }"
          ></span>
          {{ description }}
        </a>
      </template>
      <template v-else>
        <div
          :class="[
            'card--info__description__text',
            { 'card--info__description__text--truncate': truncateText },
          ]"
          :title="description"
        >
          <span
            v-if="isColorValue"
            class="card--info__description__color"
            :style="{ backgroundColor: String(description) }"
          ></span>
          {{ description }}
        </div>
      </template>
      <client-only>
        <button
          v-if="showCopyButton"
          v-tooltip="'Copiar al portapapeles'"
          @click="copyToClipboard"
        >
          <IconCopy size="18" />
        </button>
      </client-only>
    </div>
    <div v-else class="card--info__description">--</div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import "floating-vue/dist/style.css";
import { Copy as IconCopy, Info as IconInfo } from "lucide-vue-next";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: [String, Number],
    default: "",
  },
  link: {
    type: String,
    default: "",
  },
  showCopyButton: {
    type: Boolean,
    default: false,
  },
  truncateText: {
    type: Boolean,
    default: false,
  },
  info: {
    type: String,
    default: "",
  },
});

const isColorValue = computed(() => {
  if (typeof props.description !== "string") return false;
  const value = props.description.trim();
  return /^#([\dA-Fa-f]{3}|[\dA-Fa-f]{6})$/.test(value);
});

const copyToClipboard = () => {
  const contentToCopy = props.description || props.description;
  navigator.clipboard.writeText(String(contentToCopy));
};
</script>
