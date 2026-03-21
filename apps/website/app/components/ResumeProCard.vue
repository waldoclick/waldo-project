<template>
  <section class="resume resume--pro">
    <div class="resume--pro__container">
      <div class="resume--pro__header">
        <div class="resume--pro__header__icon">
          <IconCheckCircle :size="24" />
        </div>
        <h1 class="resume--pro__header__title title">
          {{ title }}
        </h1>
        <p class="resume--pro__header__description paragraph">
          {{ description }}
        </p>
      </div>

      <client-only>
        <template v-if="summary">
          <div class="resume--pro__box">
            <div class="resume--pro__subtitle">
              <h2 class="resume--pro__subtitle__title">Tarjeta registrada</h2>
            </div>
            <div class="resume--pro__details">
              <div class="resume--pro__grid">
                <CardInfo
                  title="Tipo de tarjeta"
                  :description="summary.cardType || 'No disponible'"
                />
                <CardInfo
                  title="Ultimos 4 digitos"
                  :description="summary.cardLast4 || 'No disponible'"
                />
              </div>
            </div>
          </div>
        </template>
      </client-only>
    </div>
  </section>
</template>

<script setup>
import { CheckCircle as IconCheckCircle } from "lucide-vue-next";

defineProps({
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  summary: {
    type: Object,
    default: () => null,
  },
});
</script>
