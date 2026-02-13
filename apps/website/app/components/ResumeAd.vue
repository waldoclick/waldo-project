<template>
  <section class="resume resume--ad">
    <div class="resume--ad__container">
      <!-- 1. General -->
      <div class="resume--ad__box">
        <div class="resume--ad__subtitle">
          <h2 class="resume--ad__subtitle__title">Compraste</h2>
        </div>
        <div class="resume--ad__details">
          <div class="resume--ad__grid">
            <CardInfo
              title="15 avisos por $ 90.000 "
              description="3 destacados de regalo + perfil vendedor"
            />
            <CardInfo
              title="Destacado x $ 10.000"
              description="Aparecerás de los primeros en las listas."
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import CardInfo from "@/components/CardInfo.vue";
</script>

<style scoped>
/* Aquí puedes agregar tus estilos */
</style>
