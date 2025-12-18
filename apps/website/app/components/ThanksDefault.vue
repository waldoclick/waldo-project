<template>
  <section class="thanks thanks--default">
    <div class="thanks--default__container">
      <div class="thanks--default__box">
        <MessageDefault
          type="success"
          title="¡Listo!, Creaste tu anuncio con éxito."
          description="Ahora debes esperar que tu anuncio pase por nuestra revisión, te avisaremos a tu correo electrónico cuando sea publicado."
          footer="Ir al inicio"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import MessageDefault from "@/components/MessageDefault.vue";
</script>
