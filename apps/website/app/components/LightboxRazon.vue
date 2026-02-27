<template>
  <div :class="{ 'is-open': isOpen }" class="lightbox lightbox--razon">
    <div class="lightbox--razon__backdrop" @click="handleClose" />
    <div class="lightbox--razon__box" role="dialog" aria-modal="true">
      <button
        title="Cerrar"
        type="button"
        class="lightbox__button"
        @click="handleClose"
      >
        <IconX :size="24" />
      </button>
      <div class="lightbox--razon__title">{{ title }}</div>
      <div v-if="description" class="lightbox--razon__text">
        {{ description }}
      </div>
      <div class="form__group lightbox--razon__field">
        <label class="form__label" :for="textareaId">Razón</label>
        <textarea
          :id="textareaId"
          v-model="localReason"
          class="form__control"
          :placeholder="placeholder"
          rows="4"
        />
      </div>
      <div class="lightbox--razon__actions">
        <button class="btn btn--secondary" type="button" @click="handleClose">
          {{ cancelLabel }}
        </button>
        <button
          class="btn btn--primary"
          type="button"
          :disabled="isSubmitDisabled"
          @click="handleSubmit"
        >
          {{ submitLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { X as IconX } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    title: string;
    description?: string;
    placeholder?: string;
    submitLabel?: string;
    cancelLabel?: string;
    initialReason?: string;
    loading?: boolean;
  }>(),
  {
    description: "",
    placeholder: "Escribe la razón...",
    submitLabel: "Desactivar",
    cancelLabel: "Cancelar",
    initialReason: "",
    loading: false,
  },
);

const emit = defineEmits<{
  (event: "close"): void;
  (event: "submit", reason: string): void;
}>();

const localReason = ref(props.initialReason);
const textareaId = `lightbox-razon-${Math.random().toString(36).slice(2)}`;

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      localReason.value = props.initialReason || "";
    }
  },
);

const isSubmitDisabled = computed(() => {
  return props.loading || localReason.value.trim().length === 0;
});

function handleClose() {
  emit("close");
}

function handleSubmit() {
  if (isSubmitDisabled.value) return;
  emit("submit", localReason.value.trim());
}
</script>
