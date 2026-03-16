<template>
  <div>
    <h1>Ha ocurrido un error</h1>
    <p>{{ error?.message }}</p>
    <pre
      style="
        font-size: 11px;
        white-space: pre-wrap;
        background: #1a1a1a;
        color: #f87171;
        padding: 12px;
        margin: 12px 0;
        border-radius: 4px;
      "
      >{{ error?.stack }}</pre
    >
    <NuxtLink to="/auth/login">Ir al login</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const error = useError();
</script>
