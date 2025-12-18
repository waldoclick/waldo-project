<template>
  <NuxtLink v-if="showEditLinks" :to="to" class="btn btn--edit" :title="title">
    <IconPencil :size="16" class="icon-edit" />
    Editar
  </NuxtLink>
</template>

<script setup>
import { Pencil as IconPencil } from "lucide-vue-next";

defineProps({
  showEditLinks: {
    type: Boolean,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});
</script>
