<template>
  <section id="como-publicar" class="howto howto--default" :class="isSeparator">
    <div class="howto--default__container">
      <div class="howto--default__head">
        <div class="howto--default__head__title">
          <h2 class="title">
            {{ title }}
          </h2>
        </div>
        <div class="howto--default__head__subtitle">
          {{ description }}
        </div>
      </div>

      <div class="howto--default__steps">
        <CardHowTo
          v-for="(item, index) in items.data"
          :key="index"
          :title="item.title"
          :description="item.description"
          :image="getImage(index)"
          :text-button="item.text_button"
          :revert="index % 2 === 0 ? false : true"
          :show-line="index < 3"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import CardHowTo from "@/components/CardHowTo.vue";
import howtoData from "@/content/howto.json"; // Asegúrate de que la ruta sea correcta

const items = ref(howtoData);

const title = "¿Tienes equipos para vender?";
const description = "Publica tu anuncio en pocos pasos";

// Importa las imágenes directamente
import stepImage1 from "/images/steps-01.svg";
import stepImage2 from "/images/steps-02.svg";
import stepImage3 from "/images/steps-03.svg";

const images = [stepImage1, stepImage2, stepImage3];

const getImage = (index: number) => {
  return images[index] || "";
};

const isSeparator = computed(() => {
  return "";
});
</script>
