<template>
  <section class="contact contact--default">
    <div class="contact--default__container">
      <div class="contact--default__header">
        <h1 class="contact--default__title title">Escríbenos tus dudas</h1>
        <div class="contact--default__description paragraph">
          ¿Tienes preguntas sobre cómo publicar, comprar o vender equipos
          industriales en Waldo.click®? Completa el formulario y nuestro equipo
          te responderá a la brevedad.
        </div>
      </div>
      <div class="contact--default__form">
        <FormContact />
      </div>
      <div class="contact--default__address">
        <AddressDefault />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import FormContact from "@/components/FormContact.vue";
import AddressDefault from "@/components/AddressDefault.vue";
</script>
