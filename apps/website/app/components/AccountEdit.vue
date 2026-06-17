<template>
  <section class="account account--edit" aria-labelledby="profile-edit-title">
    <!-- Header -->
    <span class="account--edit__eyebrow">Cuenta</span>
    <div class="account--edit__header">
      <div>
        <h1 id="profile-edit-title" class="account--edit__title">Mi perfil</h1>
        <p class="account--edit__intro">
          Tu identidad en Waldo.click. Esto es lo que ven los compradores cuando
          revisan tus anuncios.
        </p>
      </div>
      <nav class="account--edit__toggle" aria-label="Ver o editar perfil">
        <NuxtLink to="/cuenta/perfil" class="account--edit__toggle__btn">
          Ver
        </NuxtLink>
        <NuxtLink
          to="/cuenta/perfil/editar"
          class="account--edit__toggle__btn account--edit__toggle__btn--active"
        >
          Editar
        </NuxtLink>
      </nav>
    </div>

    <!-- Edit card wrapping FormProfile -->
    <div class="account--edit__card">
      <FormProfile />
    </div>
  </section>
</template>

<script setup>
import FormProfile from "@/components/FormProfile.vue";
</script>
