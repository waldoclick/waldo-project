<template>
  <section class="why-cta">
    <div class="container">
      <div class="why-cta__panel">
        <span class="why-cta__panel__glow" aria-hidden="true"></span>
        <div class="why-cta__panel__content">
          <h2 class="why-cta__panel__content__title">Empieza ahora</h2>
          <p class="why-cta__panel__content__text">
            Explora los anuncios disponibles o publica tu equipo. Tus primeros 3
            avisos son gratis.
          </p>
        </div>
        <div class="why-cta__panel__actions">
          <NuxtLink to="/anuncios" class="why-cta__panel__actions__primary">
            Explorar anuncios
          </NuxtLink>
          <NuxtLink to="/anunciar" class="why-cta__panel__actions__secondary">
            Anunciar ahora
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
