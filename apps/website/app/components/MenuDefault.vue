<template>
  <ul class="menu menu--default">
    <li>
      <NuxtLink to="/anuncios" title="Anuncios">
        <span>Anuncios</span>
      </NuxtLink>
    </li>
    <li>
      <NuxtLink to="/por-que-waldo" title="Por qué Waldo">
        <span>Por qué Waldo</span>
      </NuxtLink>
    </li>
    <li>
      <NuxtLink to="/blog" title="Blog">
        <span>Blog</span>
      </NuxtLink>
    </li>
  </ul>
</template>

<script lang="ts">
export default {
  name: "MenuDefault",
};
</script>
