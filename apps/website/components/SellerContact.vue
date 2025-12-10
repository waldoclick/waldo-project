<template>
  <div class="seller seller--default">
    <div class="seller--default__box">
      <span class="seller--default__title">Correo electrónico</span>
      <span class="seller--default__text">
        <a :href="`mailto:${email}`" class="seller--default__email">{{
          email
        }}</a>
      </span>
    </div>
    <div class="seller--default__box">
      <span class="seller--default__title">Teléfono</span>
      <span class="seller--default__text">
        <a :href="`tel:${phone}`" class="seller--default__phone">{{ phone }}</a>
      </span>
    </div>
    <div class="seller--default__box">
      <span class="seller--default__text">
        <nuxt-link
          :to="`/${username}`"
          class="showcase"
          title="Ver perfil del vendedor"
        >
          Ver perfil del vendedor
        </nuxt-link>
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});
</script>
