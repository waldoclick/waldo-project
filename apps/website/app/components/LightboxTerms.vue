<template>
  <div :class="{ 'is-open': isOpen }" class="lightbox lightbox--terms">
    <div class="lightbox--terms__backdrop" />
    <div class="lightbox--terms__box" role="dialog" aria-modal="true">
      <div class="lightbox--terms__title">Términos pendientes</div>
      <div class="lightbox--terms__text">
        Para continuar necesitas aceptar los siguientes términos.
      </div>
      <FormTerms />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import FormTerms from "@/components/FormTerms.vue";

const { hasAcceptedTerms } = useUser();

const isOpen = ref(false);

onMounted(() => {
  if (!hasAcceptedTerms.value) {
    isOpen.value = true;
  }
});

watch(hasAcceptedTerms, (accepted) => {
  if (accepted) {
    isOpen.value = false;
  }
});
</script>
