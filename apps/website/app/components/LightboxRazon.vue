<template>
  <div class="lightbox lightbox--razon" :class="{ 'is-open': isOpen }">
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
      <div class="lightbox--razon__title">Desactivar publicación</div>
      <div class="lightbox--razon__text">
        Esta razón quedará registrada en el anuncio.
      </div>
      <div class="form__group lightbox--razon__field">
        <label class="form__label" :for="textareaId">Razón</label>
        <textarea
          :id="textareaId"
          v-model="localReason"
          class="form__control"
          placeholder="Escribe la razón..."
          rows="4"
        />
      </div>
      <div class="lightbox--razon__actions">
        <button class="btn btn--secondary" type="button" @click="handleClose">
          Cancelar
        </button>
        <button
          class="btn btn--primary"
          type="button"
          :disabled="isSubmitDisabled"
          @click="handleSubmit"
        >
          Desactivar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { X as IconX } from "lucide-vue-next";
import { useAppStore } from "@/stores/app.store";

const appStore = import.meta.client
  ? useAppStore()
  : ({} as ReturnType<typeof useAppStore>);

const isOpen = computed(() => appStore.isDeactivateLightboxActive);

const DEFAULT_REASON = "Ya vendí el producto.";
const localReason = ref(DEFAULT_REASON);
const isSubmitting = ref(false);

const textareaId = `lightbox-razon-${Math.random().toString(36).slice(2)}`;

watch(isOpen, (opened) => {
  if (opened) {
    localReason.value = DEFAULT_REASON;
  }
});

const isSubmitDisabled = computed(
  () => isSubmitting.value || localReason.value.trim().length === 0,
);

function handleClose() {
  appStore.closeDeactivateLightbox();
}

async function handleSubmit() {
  const reason = localReason.value.trim();
  if (!reason || isSubmitting.value) return;
  const adDocumentId = appStore.deactivateAdId;
  if (!adDocumentId) return;
  isSubmitting.value = true;
  // Lazy-init stores inside handler — safe, never runs during SSR
  const userStore = useUserStore();
  const { Swal } = useSweetAlert2();
  try {
    await userStore.deactivateAd(adDocumentId, reason);
    appStore.closeDeactivateLightbox();
    await Swal.fire({
      title: "Publicación desactivada",
      text: "Tu publicación ha sido desactivada exitosamente.",
      icon: "success",
      confirmButtonText: "Aceptar",
    });
    window.location.reload();
  } catch (error) {
    console.error("Error al desactivar publicación:", error);
    Swal.fire({
      title: "Error",
      text: "No se pudo desactivar la publicación. Por favor, intenta nuevamente.",
      icon: "error",
      confirmButtonText: "Aceptar",
    });
  } finally {
    isSubmitting.value = false;
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isOpen.value) {
    handleClose();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>
