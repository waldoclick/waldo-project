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

<script setup>
import { ref } from "vue";
import "floating-vue/dist/style.css";
import {
  Copy as IconCopy,
  Info as IconInfo,
  ExternalLink as IconExternalLink,
} from "lucide-vue-next";
import { useToast } from "../composables/useNotifications";

const toast = useToast();
const props = defineProps({
  title: {
    type: String,
    default: "",
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

const isOpen = ref(false);

const handleTooltip = () => {
  isOpen.value = true;

  setTimeout(() => {
    isOpen.value = false;
  }, 2000);
};

const copyToClipboard = () => {
  const contentToCopy = props.description || props.description;
  navigator.clipboard.writeText(contentToCopy);
  toast.success("¡Texto copiado al portapapeles!");
};
</script>
