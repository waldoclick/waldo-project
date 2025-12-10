<template>
  <nuxt-link
    to="/anunciar"
    class="btn btn--create"
    title="Publicar nuevo anuncio"
  >
    <IconPlusCircle :size="20" class="icon-plus" />
    Publicar nuevo anuncio
  </nuxt-link>
</template>

<script setup lang="ts">
import { PlusCircle as IconPlusCircle } from "lucide-vue-next";
</script>
