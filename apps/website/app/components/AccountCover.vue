<template>
  <section class="account account--edit" aria-labelledby="cover-photo-title">
    <div class="account--edit__header">
      <h1 id="cover-photo-title" class="account--edit__title title">
        Personaliza tu portada
      </h1>
      <div class="account--edit__text paragraph">
        <p>
          ¡Dale un toque único a tu perfil! Una portada personalizada es la
          primera impresión que otros usuarios tendrán de ti en Waldo.click®.
          Sube una imagen que represente tu actividad o negocio y haz que tu
          perfil sea más atractivo y profesional.
        </p>
      </div>
    </div>
    <div class="account--edit__form" aria-describedby="cover-photo-title">
      <UploadCover />
    </div>
  </section>
</template>

<script setup>
import UploadCover from "@/components/UploadCover.vue";
</script>
