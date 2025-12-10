<template>
  <ul class="menu menu--default">
    <li>
      <NuxtLink to="/#categorias" title="Categorías">
        <span>Categorías</span>
      </NuxtLink>
    </li>
    <li>
      <NuxtLink to="/#como-publicar" title="¿Cómo publicar?">
        <span>¿Cómo publicar?</span>
      </NuxtLink>
    </li>
    <li>
      <NuxtLink to="/#comprar-packs" title="Comprar packs">
        <span>Comprar packs</span>
      </NuxtLink>
    </li>
  </ul>
</template>

<script lang="ts">
export default {
  name: "MenuDefault",
};
</script>
