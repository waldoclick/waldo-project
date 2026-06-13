<template>
  <div v-if="password" class="strength">
    <div class="strength__bars">
      <span
        v-for="n in 4"
        :key="n"
        class="strength__bar"
        :class="n <= result.score ? `strength__bar--level${result.score}` : ''"
      />
    </div>
    <span
      class="strength__label"
      :class="`strength__label--level${result.score}`"
    >
      {{ result.label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ password: string }>();

const result = computed(() => computePasswordStrength(props.password));
</script>
