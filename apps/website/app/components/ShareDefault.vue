<template>
  <div class="share share--default">
    <span class="share--default__label">Compartir aviso</span>
    <div class="share--default__actions">
      <a
        v-tooltip="'Compartir en Facebook'"
        class="share--default__actions__item"
        :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl,
        )}`"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconFacebook :size="16" />
      </a>
      <a
        v-tooltip="'Compartir en X (Twitter)'"
        class="share--default__actions__item"
        :href="`https://twitter.com/intent/tweet?url=${encodeURIComponent(
          shareUrl,
        )}&text=${encodeURIComponent(shareTitle)}`"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconX />
      </a>
      <a
        v-tooltip="'Compartir en WhatsApp'"
        class="share--default__actions__item"
        :href="`https://wa.me/?text=${encodeURIComponent(
          shareTitle + ' ' + shareUrl,
        )}`"
        target="_blank"
        rel="noopener noreferrer"
      >
        <IconWhatsApp />
      </a>
      <button
        v-tooltip="'Copiar enlace'"
        class="share--default__actions__item"
        @click="copyToClipboard"
      >
        <Check
          v-if="copied"
          class="share--default__actions__item__check"
          :size="16"
        />
        <IconLink v-else :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useClipboard } from "@vueuse/core";
import {
  Facebook as IconFacebook,
  Link as IconLink,
  Check,
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
const copied = ref(false);

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
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1500);
    toast.success("¡Enlace copiado al portapapeles!");
  } catch (err) {
    console.error("Error al copiar al portapapeles:", err);
    toast.error("Error al copiar el enlace");
  }
};
</script>
