<template>
  <div class="reminder reminder--default">
    <b>Recuerda:</b>
    Para ver datos del vendedor y de contacto debes
    <LinkLogin />
    o
    <nuxt-link :to="{ name: 'registro' }" title="Registrarte">
      Registrarte
    </nuxt-link>
  </div>
</template>

<script setup>
import LinkLogin from "@/components/LinkLogin.vue";
</script>
