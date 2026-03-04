<template>
  <div class="bar bar--announcement">
    <div ref="progressElement" class="bar--announcement__percent" />
    <div class="container container--fluid">
      <div class="bar--announcement__container">
        <div class="bar--announcement__col bar--announcement__col--left">
          <button
            v-show="showBack"
            type="button"
            class="btn btn--secondary btn--block"
            :disabled="backDisabled"
            @click="emit('back')"
          >
            <span>Volver</span>
          </button>
        </div>

        <div
          v-if="showSteps && totalSteps"
          class="bar--announcement__col bar--announcement__col--center"
        >
          <div class="bar--announcement__steps">
            <b>{{ currentStep }}</b> de {{ totalSteps }}
          </div>
        </div>

        <div class="bar--announcement__col bar--announcement__col--right">
          <div class="bar--announcement__actions">
            <SummaryDefault
              v-if="summaryText"
              title="Tipo de anuncio"
              :text="summaryText"
            />

            <button
              type="submit"
              class="btn btn--primary btn--block"
              :disabled="primaryDisabled"
              :title="primaryLabel"
              @click="emit('primary')"
            >
              <span>{{ primaryLabel }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import SummaryDefault from "@/components/SummaryDefault.vue";

const props = withDefaults(
  defineProps<{
    percentage?: number;
    currentStep?: number;
    totalSteps?: number;
    showSteps?: boolean;
    summaryText?: string;
    primaryLabel: string;
    primaryDisabled?: boolean;
    backDisabled?: boolean;
    showBack?: boolean;
  }>(),
  {
    percentage: 0,
    currentStep: 1,
    totalSteps: undefined,
    showSteps: true,
    summaryText: "",
    primaryDisabled: false,
    backDisabled: false,
    showBack: true,
  },
);

const emit = defineEmits<{
  (e: "back" | "primary"): void;
}>();

const progressElement = ref<HTMLElement | null>(null);

const updateProgress = () => {
  if (progressElement.value) {
    progressElement.value.style.setProperty(
      "--progress-width",
      `${props.percentage}%`,
    );
  }
};

onMounted(updateProgress);

watch(
  () => props.percentage,
  () => {
    updateProgress();
  },
);
</script>
