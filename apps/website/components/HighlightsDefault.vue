<template>
  <section class="highlights highlights--default">
    <div class="highlights--default__container">
      <div class="highlights--default__list">
        <CardHighlight
          v-for="(item, index) in dataDefault"
          :key="index"
          :title="item.title"
          :icon="item.icon"
          :description="item.description"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// components
import CardHighlight from "@/components/CardHighlight.vue";
import {
  Search as IconSearch,
  Filter as IconFilter,
  Phone as IconPhone,
} from "lucide-vue-next";

const dataDefault = [
  {
    title: "Busca equipo",
    description:
      "Tenemos cientos de anuncios que se ajustan a tus necesidades.",
    icon: IconSearch,
  },
  {
    title: "Filtra y elige",
    description:
      "Ajusta los resultados y elige el mejor, prefiere los anuncios destacados.",
    icon: IconFilter,
  },
  {
    title: "Contacta y coordina",
    description: "Llama o escribe al vendedor para coordinar la compra.",
    icon: IconPhone,
  },
];
</script>
