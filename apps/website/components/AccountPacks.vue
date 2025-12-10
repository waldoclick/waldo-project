<template>
  <ErrorBoundary>
    <section class="account account--packs">
      <div class="account--packs__title">Comprar Packs</div>
      <div class="account--packs__subtitle">
        Ahorra desde un 40% y obten tu perfil de vendedor comprando uno de estos
        packs.
      </div>

      <div class="account--packs__list">
        <PacksDefault title="" :separator="false" />
      </div>

      <div class="account--packs__faq">
        <FaqDefault title="Preguntas frecuentes" :limit="3" />
      </div>
    </section>
  </ErrorBoundary>
</template>

<script setup>
import PacksDefault from "@/components/PacksDefault.vue";
import FaqDefault from "@/components/FaqDefault.vue";
</script>
