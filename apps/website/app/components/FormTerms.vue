<template>
  <form class="form form--terms" @submit.prevent="handleAccept">
    <div class="form-group">
      <div class="form-check">
        <input
          id="terms-age-confirmation"
          v-model="ageConfirmed"
          type="checkbox"
          class="form-check-input"
        />
        <label class="form-check-label" for="terms-age-confirmation">
          Confirmo que soy mayor de edad
        </label>
      </div>
    </div>
    <div class="form-group">
      <div class="form-check">
        <input
          id="terms-accepted"
          v-model="termsAccepted"
          type="checkbox"
          class="form-check-input"
        />
        <label class="form-check-label" for="terms-accepted">
          Acepto los términos y las
          <NuxtLink to="/politicas-de-privacidad" target="_blank"
            >políticas de privacidad</NuxtLink
          >
        </label>
      </div>
    </div>
    <div class="form__send">
      <button
        class="btn btn--primary btn--block"
        type="submit"
        :disabled="!canSubmit"
      >
        <span v-if="!loading">Aceptar</span>
        <span v-else>Guardando…</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const { acceptTerms } = useUser();

const ageConfirmed = ref(false);
const termsAccepted = ref(false);
const loading = ref(false);

const canSubmit = computed(
  () => ageConfirmed.value && termsAccepted.value && !loading.value,
);

async function handleAccept() {
  loading.value = true;
  try {
    await acceptTerms();
  } finally {
    loading.value = false;
  }
}
</script>
