<template>
  <form class="form form--terms" @submit.prevent="handleAccept">
    <div v-if="needsAgeConfirmation" class="form-group">
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
    <div v-if="needsTerms" class="form-group">
      <div class="form-check">
        <input
          id="terms-accepted"
          v-model="termsAccepted"
          type="checkbox"
          class="form-check-input"
        />
        <label class="form-check-label" for="terms-accepted">
          Acepto las
          <NuxtLink to="/politicas-de-privacidad" target="_blank"
            >políticas de privacidad</NuxtLink
          >
        </label>
      </div>
    </div>
    <div v-if="needsUsageTerms" class="form-group">
      <div class="form-check">
        <input
          id="terms-usage-accepted"
          v-model="usageTermsAccepted"
          type="checkbox"
          class="form-check-input"
        />
        <label class="form-check-label" for="terms-usage-accepted">
          Acepto las
          <NuxtLink to="/condiciones-de-uso" target="_blank"
            >condiciones de uso</NuxtLink
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
import type { User } from "@/types/user";

const { acceptTerms } = useUser();
const user = useStrapiUser<User>();

const needsAgeConfirmation = computed(
  () => !user.value?.accepted_age_confirmation,
);
const needsTerms = computed(() => !user.value?.accepted_terms);
const needsUsageTerms = computed(() => !user.value?.accepted_usage_terms);

const ageConfirmed = ref(false);
const termsAccepted = ref(false);
const usageTermsAccepted = ref(false);
const loading = ref(false);

const canSubmit = computed(
  () =>
    (!needsAgeConfirmation.value || ageConfirmed.value) &&
    (!needsTerms.value || termsAccepted.value) &&
    (!needsUsageTerms.value || usageTermsAccepted.value) &&
    !loading.value,
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
