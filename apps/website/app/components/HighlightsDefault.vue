<template>
  <section class="highlights highlights--default">
    <div class="highlights--default__container">
      <div class="highlights--default__head">
        <span class="highlights--default__head__eyebrow">
          <span
            class="highlights--default__head__eyebrow__dot"
            aria-hidden="true"
          ></span>
          Para comprar
        </span>
        <h2 class="highlights--default__head__title">
          Encuentra el equipo que necesitas
        </h2>
        <p class="highlights--default__head__text">
          Cientos de anuncios organizados por industria, en tres pasos simples.
        </p>
      </div>

      <div class="highlights--default__list">
        <article
          v-for="(item, index) in dataDefault"
          :key="index"
          class="highlights--default__card"
        >
          <span class="highlights--default__card__number" aria-hidden="true">
            {{ item.number }}
          </span>
          <span class="highlights--default__card__icon" aria-hidden="true">
            <component :is="item.icon" :size="25" />
          </span>
          <div class="highlights--default__card__body">
            <span class="highlights--default__card__body__step">
              Paso {{ item.number }}
            </span>
            <h3 class="highlights--default__card__body__title">
              {{ item.title }}
            </h3>
            <p class="highlights--default__card__body__text">
              {{ item.description }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  Search as IconSearch,
  ListFilter as IconFilter,
  Phone as IconPhone,
} from "lucide-vue-next";

const dataDefault = [
  {
    number: "01",
    title: "Busca equipo",
    description:
      "Tenemos cientos de anuncios que se ajustan a lo que tu operación necesita.",
    icon: IconSearch,
  },
  {
    number: "02",
    title: "Filtra y elige",
    description:
      "Ajusta los resultados y elige el mejor. Prioriza los anuncios destacados.",
    icon: IconFilter,
  },
  {
    number: "03",
    title: "Contacta y coordina",
    description:
      "Llama o escribe directo al vendedor para coordinar la compra. Sin intermediarios.",
    icon: IconPhone,
  },
];
</script>
