<template>
  <article class="card card--info">
    <div class="card--info__title">
      {{ title }}
    </div>
    <div v-if="hasDescription" class="card--info__description">
      <client-only>
        <button v-if="info" v-tooltip="info">
          <IconInfo size="18" />
        </button>
      </client-only>
      <template v-if="isObjectOrArray">
        <div class="card--info__description__code-wrapper">
          <client-only>
            <pre
              class="card--info__description__pre"
            ><code ref="codeRef" class="language-json">{{ formattedJson }}</code></pre>
          </client-only>
        </div>
      </template>
      <template v-else-if="link">
        <a
          :class="[
            'card--info__description__text',
            { 'card--info__description__text--truncate': truncateText },
          ]"
          :href="link"
          :title="String(description)"
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
          :title="String(description)"
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
          v-if="showCopyButton && !isObjectOrArray"
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
import { ref, computed, onMounted, watch, nextTick } from "vue";
import "floating-vue/dist/style.css";
import "highlight.js/styles/github.css";
import hljs from "highlight.js";
import { Copy as IconCopy, Info as IconInfo } from "lucide-vue-next";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: [String, Number, Object, Array],
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

const codeRef = ref<HTMLElement | null>(null);

const isObjectOrArray = computed(() => {
  const d = props.description;
  return typeof d === "object" && d !== null;
});

const hasDescription = computed(() => {
  const d = props.description;
  if (d === undefined || d === null) return false;
  if (typeof d === "string" && d === "") return false;
  return true;
});

const formattedJson = computed(() => {
  if (!isObjectOrArray.value) return "";
  try {
    return JSON.stringify(props.description, null, 2);
  } catch {
    return String(props.description);
  }
});

const isColorValue = computed(() => {
  if (typeof props.description !== "string") return false;
  const value = (props.description as string).trim();
  return /^#([\dA-Fa-f]{3}|[\dA-Fa-f]{6})$/.test(value);
});

function applyHighlight() {
  nextTick(() => {
    if (codeRef.value && isObjectOrArray.value) {
      hljs.highlightElement(codeRef.value);
    }
  });
}

onMounted(() => {
  applyHighlight();
});

watch(
  () => [props.description, isObjectOrArray.value],
  () => {
    applyHighlight();
  },
  { deep: true },
);

watch(
  () => codeRef.value,
  (el) => {
    if (el && isObjectOrArray.value) applyHighlight();
  },
  { flush: "post" },
);

const copyToClipboard = () => {
  const contentToCopy = isObjectOrArray.value
    ? formattedJson.value
    : String(props.description ?? "");
  navigator.clipboard.writeText(contentToCopy);
};
</script>

<style scoped>
.card--info__description__code-wrapper {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: visible;
  border-radius: 0.25rem;
  border: 1px solid var(--color-border, #e5e7eb);
  padding: 0.75rem;
  background: var(--color-bg-code, #f6f8fa);
  box-sizing: border-box;
}

.card--info__description__pre {
  margin: 0;
  padding: 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  white-space: pre;
  min-width: min-content;
  display: inline-block;
}

.card--info__description__pre code {
  padding: 0;
  background: transparent;
}
</style>
