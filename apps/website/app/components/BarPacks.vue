<template>
  <div class="bar bar--packs">
    <div class="container container--fluid">
      <div class="bar--packs__container">
        <div class="bar--packs__col bar--packs__col--left">
          <button
            type="button"
            class="btn btn--secondary btn--block"
            :disabled="backDisabled"
            @click="emit('back')"
          >
            <span>Volver</span>
          </button>
        </div>

        <div class="bar--packs__col bar--packs__col--right">
          <div class="bar--packs__actions">
            <SummaryDefault
              v-if="summaryText"
              title="Tipo de pack"
              :text="summaryText"
            />

            <button
              type="button"
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
import SummaryDefault from "@/components/SummaryDefault.vue";

const props = withDefaults(
  defineProps<{
    summaryText?: string;
    primaryLabel?: string;
    primaryDisabled?: boolean;
    backDisabled?: boolean;
  }>(),
  {
    summaryText: "",
    primaryLabel: "Ir a pagar",
    primaryDisabled: false,
    backDisabled: false,
  },
);

const emit = defineEmits<{
  (e: "back" | "primary"): void;
}>();
</script>
