<template>
  <div
    v-tooltip="{
      content: businessCard
        ? 'Escanea para obtener la tarjeta de contacto del vendedor'
        : 'Escanea para visitar la página',
      placement: 'top',
    }"
    class="qr qr--default"
  >
    <!-- <pre>{{ qrData }}</pre> -->
    <client-only>
      <QRCodeVue
        :value="qrData"
        :size="qrSize"
        :margin="margin"
        :level="level"
        render-as="svg"
      />
    </client-only>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import QRCodeVue from "qrcode.vue";

const props = withDefaults(
  defineProps<{
    url?: string;
    size?: string | number;
    margin?: number;
    level?: "L" | "M" | "Q" | "H";
    businessCard?: {
      firstname: string;
      lastname: string;
      phone: string;
      email: string;
      is_company?: boolean;
      business_name?: string;
    };
  }>(),
  {
    url: "",
    size: 200,
    margin: 0,
    level: "L",
    businessCard: undefined,
  },
);

// Asegurarse de que size sea un número
const qrSize = computed(() => {
  return typeof props.size === "string"
    ? Number.parseInt(props.size, 10)
    : props.size;
});

const qrData = computed(() => {
  if (props.businessCard) {
    return `BEGIN:VCARD
VERSION:3.0
N:${props.businessCard.lastname};${props.businessCard.firstname};;;
FN:${props.businessCard.firstname} ${props.businessCard.lastname}
${props.businessCard.is_company && props.businessCard.business_name ? `ORG:${props.businessCard.business_name}\n` : ""}TEL:${props.businessCard.phone}
EMAIL:${props.businessCard.email}
END:VCARD`;
  }

  return props.url || (import.meta.client ? window.location.href : "");
});
</script>
