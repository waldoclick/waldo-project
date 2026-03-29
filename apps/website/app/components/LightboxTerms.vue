<template>
  <div :class="{ 'is-open': isOpen }" class="lightbox lightbox--terms">
    <div class="lightbox--terms__backdrop" />
    <div class="lightbox--terms__box" role="dialog" aria-modal="true">
      <div class="lightbox--terms__title">Confirmacion de edad y terminos</div>
      <div class="lightbox--terms__text">
        Para continuar usando el sitio debes confirmar que eres mayor de edad y
        aceptar nuestros terminos y
        <NuxtLink to="/politicas-de-privacidad" target="_blank">
          politicas de privacidad </NuxtLink
        >.
      </div>
      <div class="lightbox--terms__checkboxes">
        <div class="lightbox--terms__checkboxes__row">
          <input
            id="terms-age-confirmation"
            v-model="ageConfirmed"
            type="checkbox"
          />
          <label for="terms-age-confirmation">
            Confirmo que soy mayor de edad
          </label>
        </div>
        <div class="lightbox--terms__checkboxes__row">
          <input id="terms-accepted" v-model="termsAccepted" type="checkbox" />
          <label for="terms-accepted">
            Acepto los terminos y las
            <NuxtLink to="/politicas-de-privacidad" target="_blank">
              politicas de privacidad
            </NuxtLink>
          </label>
        </div>
      </div>
      <div class="lightbox--terms__actions">
        <button
          class="btn btn--primary btn--block"
          type="button"
          :disabled="!canSubmit"
          @click="handleAccept"
        >
          Aceptar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";

const { hasAcceptedTerms, acceptTerms } = useUser();

const isOpen = ref(false);
const ageConfirmed = ref(false);
const termsAccepted = ref(false);
const loading = ref(false);

const canSubmit = computed(
  () => ageConfirmed.value && termsAccepted.value && !loading.value,
);

// onMounted: client-only — user state is hydrated by then
onMounted(() => {
  if (!hasAcceptedTerms.value) {
    isOpen.value = true;
  }
});

// Close automatically if user already has consent (e.g., user logs in after mount)
watch(hasAcceptedTerms, (accepted) => {
  if (accepted) {
    isOpen.value = false;
  }
});

async function handleAccept() {
  loading.value = true;
  try {
    await acceptTerms();
    isOpen.value = false;
  } finally {
    loading.value = false;
  }
}
</script>
