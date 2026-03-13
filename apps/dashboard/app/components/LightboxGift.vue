<template>
  <div :class="{ 'is-open': isOpen }" class="lightbox lightbox--gift">
    <div class="lightbox--gift__backdrop" @click="handleClose" />
    <div class="lightbox--gift__box" role="dialog" aria-modal="true">
      <button
        title="Cerrar"
        type="button"
        class="lightbox__button"
        @click="handleClose"
      >
        <IconX :size="24" />
      </button>
      <div class="lightbox--gift__header">
        <div class="lightbox--gift__header__title">Regalar {{ label }}</div>
      </div>
      <FormGift
        :endpoint="endpoint"
        :label="label"
        :is-open="isOpen"
        @gifted="handleGifted"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";
import { X as IconX } from "lucide-vue-next";

const props = defineProps<{
  isOpen: boolean;
  endpoint: string;
  label: string;
}>();

const emit = defineEmits<{ (event: "close" | "gifted"): void }>();

watch(
  () => props.isOpen,
  (isOpen) => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  },
);

function handleClose(): void {
  document.body.style.overflow = "";
  emit("close");
}

function handleGifted(): void {
  emit("gifted");
  handleClose();
}
</script>
