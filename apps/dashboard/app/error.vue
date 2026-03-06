<template>
  <div>
    <h1>Ha ocurrido un error</h1>
    <p>{{ error?.message }}</p>
    <NuxtLink to="/auth/login">Ir al login</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const error = useError();
</script>
