<template>
  <section class="sell-cta">
    <div class="container">
      <div class="sell-cta__panel">
        <span class="sell-cta__panel__glow" aria-hidden="true"></span>
        <div class="sell-cta__panel__content">
          <h2 class="sell-cta__panel__content__title">
            ¿Tienes equipos para vender?
          </h2>
          <p class="sell-cta__panel__content__text">
            Publica tu anuncio y llega a compradores de toda la industria. Tus
            primeros 3 avisos son gratis.
          </p>
        </div>
        <div class="sell-cta__panel__actions">
          <NuxtLink to="/anunciar" class="sell-cta__panel__actions__primary">
            Anunciar ahora
          </NuxtLink>
          <NuxtLink
            to="/preguntas-frecuentes"
            class="sell-cta__panel__actions__secondary"
          >
            Cómo funciona
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
