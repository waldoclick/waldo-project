<template>
  <div class="bar bar--create">
    <div class="container container--fluid">
      <div ref="progressElement" class="bar--create__percent"></div>
      <div class="bar--create__container">
        <div class="bar--create__col bar--create__col--left">
          <button
            type="button"
            class="btn btn--secondary btn--block"
            :disabled="isBackDisabled"
            @click="$emit('back')"
          >
            <span>Volver</span>
          </button>
        </div>
        <div class="bar--create__col bar--create__col--center">
          <div class="bar--create__steps">
            <b>{{ currentStep }}</b> de {{ totalSteps }}
          </div>
        </div>
        <div class="bar--create__col bar--create__col--right">
          <button
            type="submit"
            class="btn btn--primary btn--block"
            :disabled="isSubmitDisabled || !isValid"
            @click="$emit('submit')"
          >
            <span>Continuar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

const props = defineProps<{
  percentage: number;
  currentStep: number;
  totalSteps?: number;
  isValid?: boolean;
  isBackDisabled?: boolean;
  isSubmitDisabled?: boolean;
}>();

defineEmits<{
  submit: [];
  back: [];
}>();

// Referencia al elemento de progreso
const progressElement = ref(null);

// Función para actualizar el progreso
const updateProgress = () => {
  if (progressElement.value) {
    progressElement.value.style.setProperty(
      "--progress-width",
      props.percentage + "%",
    );
  }
};

// Watch para actualizar cuando cambie el porcentaje
watch(() => props.percentage, updateProgress, { immediate: true });

// También actualizar en onMounted
onMounted(updateProgress);
</script>
