<template>
  <div class="share share--default">
    <span>
      <IconShare2 />
    </span>
    <a
      v-tooltip="'Compartir en Facebook'"
      :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`"
      target="_blank"
      rel="noopener noreferrer"
    >
      <IconFacebook />
    </a>
    <a
      v-tooltip="'Compartir en X (Twitter)'"
      :href="`https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl
      )}&text=${encodeURIComponent(shareTitle)}`"
      target="_blank"
      rel="noopener noreferrer"
    >
      <IconX />
    </a>
    <a
      v-tooltip="'Compartir en WhatsApp'"
      :href="`https://wa.me/?text=${encodeURIComponent(
        shareTitle + ' ' + shareUrl
      )}`"
      target="_blank"
      rel="noopener noreferrer"
    >
      <IconWhatsApp />
    </a>
    <a
      v-tooltip="'Compartir en LinkedIn'"
      :href="`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`"
      target="_blank"
      rel="noopener noreferrer"
    >
      <IconLinkedin />
    </a>
    <button v-tooltip="'Copiar enlace'" @click="copyToClipboard">
      <IconLink />
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, computed } from "vue";
import { useClipboard } from "@vueuse/core";
import {
  Share2 as IconShare2,
  Facebook as IconFacebook,
  Link as IconLink,
  Linkedin as IconLinkedin,
} from "lucide-vue-next";
import IconX from "./icons/IconX.vue";
import IconWhatsApp from "./icons/IconWhatsApp.vue";
import { useToast } from "../composables/useNotifications";
import { useRoute } from "vue-router";

const props = defineProps<{
  url?: string;
  title?: string;
}>();

const { copy } = useClipboard();
const toast = useToast();
const route = useRoute();

// Usar siempre la misma base URL para evitar problemas de hidratación
const baseUrl = "https://waldo.click";
const fullUrl = computed(() => {
  if (props.url) return props.url;
  return `${baseUrl}${route.fullPath}`;
});

const shareUrl = computed(() => fullUrl.value);

// Usar siempre el título proporcionado o un valor predeterminado seguro para SSR
const shareTitle = computed(() => props.title || "");

const copyToClipboard = async () => {
  if (typeof window === "undefined") return;

  try {
    await copy(shareUrl.value);
    toast.success("¡Enlace copiado al portapapeles!");
  } catch (err) {
    console.error("Error al copiar al portapapeles:", err);
    toast.error("Error al copiar el enlace");
  }
};
</script>
