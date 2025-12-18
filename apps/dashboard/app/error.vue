<template>
  <div>
    <h1>Error</h1>
    <p>{{ error.message }}</p>
    <NuxtLink to="/auth/login">Ir al login</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const error = useError();
</script>
