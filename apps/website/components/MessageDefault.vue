<template>
  <section class="message message--default">
    <div class="message--default__container">
      <div class="message--default__icon">
        <component :is="currentIcon" :size="50" class="icon-message" />
      </div>

      <h2 class="message--default__title title">
        {{ title }}
      </h2>

      <div
        class="message--default__description"
        v-html="sanitizeText(description)"
      ></div>

      <div v-if="button_show" class="message--default__button">
        <nuxt-link :to="button_link" :title="button_label" class="btn btn--buy">
          <span>{{ button_label }}</span>
        </nuxt-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import {
  CheckCircle as IconCheckCircle,
  XCircle as IconXCircle,
} from "lucide-vue-next";
import successIcon from "/images/answer-success.svg";
import failIcon from "/images/icon-empty.svg";
import { useSanitize } from "@/composables/useSanitize";

const props = defineProps({
  type: {
    type: String,
    default: "success", // Por defecto 'success'
    validator: (value) => ["success", "fail"].includes(value),
  },
  title: {
    type: String,
    default: "¡Listo!, Creaste tu anuncio con éxito.",
  },
  description: {
    type: String,
    default:
      "Ahora debes esperar que tu anuncio pase por nuestra revisión, te avisaremos a tu correo electrónico cuando sea publicado.",
  },
  button_label: {
    type: String,
    default: "Ir a mis anuncios",
  },
  button_link: {
    type: String,
    default: "/",
  },
  button_show: {
    type: Boolean,
    default: false,
  },
});

const { sanitizeText } = useSanitize();

const iconSrc = computed(() => {
  const iconMap = {
    success: successIcon,
    fail: failIcon,
  };
  return iconMap[props.type];
});

const iconTitle = computed(() => {
  return props.type === "fail" ? "icon-fail" : "icon-success";
});

const currentIcon = computed(() => {
  return props.type === "success" ? IconCheckCircle : IconXCircle;
});
</script>
