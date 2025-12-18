<template>
  <section class="hero hero--home">
    <div class="hero--home__container">
      <h1 class="hero--home__title">
        <NuxtLink to="/anunciar" class="publish" title="Anuncia"
          >Anuncia</NuxtLink
        >
        o <NuxtLink to="/anuncios" title="busca">busca</NuxtLink>
        activos industriales,
        <br />
        rápido y fácil en Waldo.click®
      </h1>
      <p class="hero--home__text">
        Encuentra cientos de vendores con ese equipo que necesitas
      </p>
      <div class="hero--home__search">
        <div class="hero--home__search__default">
          <SearchDefault type="default" />
        </div>
        <div class="hero--home__search__small">
          <SearchDefault type="small" />
        </div>
      </div>
    </div>
    <div class="hero--home__bg">
      <PictureDefault />
    </div>
  </section>
</template>

<script setup lang="ts">
import PictureDefault from "@/components/PictureDefault.vue";
import SearchDefault from "@/components/SearchDefault.vue";
</script>
