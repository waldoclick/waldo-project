<template>
  <section class="hero hero--why">
    <span class="hero--why__glow" aria-hidden="true"></span>
    <div class="hero--why__container">
      <span class="hero--why__eyebrow">
        <IconPackage :size="15" class="hero--why__eyebrow__icon" />
        Marketplace de activos industriales
      </span>
      <h1 class="hero--why__title">
        Conectamos a quien
        <span class="hero--why__title__mark">compra y vende</span>
        activos industriales
      </h1>
      <p class="hero--why__text">
        Equipos, vehículos, repuestos e insumos de toda la industria, reunidos
        en un solo lugar. Tú encuentras, contactas y coordinas directo con la
        otra parte.
      </p>
      <div class="hero--why__actions">
        <NuxtLink to="/anuncios" class="hero--why__actions__primary">
          Explorar anuncios
        </NuxtLink>
        <NuxtLink to="/anunciar" class="hero--why__actions__secondary">
          Anunciar ahora
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Package as IconPackage } from "lucide-vue-next";
</script>
