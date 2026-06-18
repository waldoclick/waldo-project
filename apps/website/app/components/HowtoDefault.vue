<template>
  <section id="como-publicar" class="howto howto--default">
    <div class="howto--default__container">
      <div class="howto--default__head">
        <h2 class="howto--default__head__title">
          ¿Tienes equipos para vender?
        </h2>
        <p class="howto--default__head__text">
          Publica tu anuncio en pocos pasos y llega a compradores de toda la
          industria.
        </p>
      </div>

      <div class="howto--default__steps">
        <div
          v-for="(item, index) in steps"
          :key="index"
          class="howto--default__steps__item"
        >
          <div class="howto--default__steps__item__image">
            <NuxtImg
              loading="lazy"
              decoding="async"
              :alt="item.title"
              :title="item.title"
              :src="item.image"
            />
          </div>
          <span class="howto--default__steps__item__badge">
            {{ index + 1 }}
          </span>
          <h3 class="howto--default__steps__item__title">
            {{ item.title }}
          </h3>
          <p class="howto--default__steps__item__text">
            {{ item.description }}
          </p>
        </div>
      </div>

      <div class="howto--default__buttons">
        <nuxt-link
          title="Anunciar ahora"
          to="/anunciar"
          class="howto--default__buttons__cta"
        >
          Anunciar ahora
        </nuxt-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import stepImage1 from "/images/steps-01.svg";
import stepImage2 from "/images/steps-02.svg";
import stepImage3 from "/images/steps-03.svg";

const steps = [
  {
    title: "Regístrate",
    description:
      "Crea tu cuenta en waldo.click y obtén 3 anuncios gratis. ¿Necesitas más? Compra un pack.",
    image: stepImage1,
  },
  {
    title: "Crea tu anuncio",
    description:
      "Ten a mano las especificaciones y fotos de tu equipo para publicar más rápido y fácil.",
    image: stepImage2,
  },
  {
    title: "Publica y vende",
    description:
      "Revisamos y publicamos tu anuncio. Solo espera los llamados de los compradores y ¡vende!",
    image: stepImage3,
  },
];
</script>
