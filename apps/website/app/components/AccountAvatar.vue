<template>
  <section class="account account--edit" aria-labelledby="profile-photo-title">
    <div class="account--edit__header">
      <h1 id="profile-photo-title" class="account--edit__title title">
        Elige tu foto de perfil
      </h1>
      <div class="account--edit__text paragraph">
        <p>
          ¡Haz que tu perfil destaque! Un avatar personalizado ayuda a crear
          confianza y hace que tu presencia en Waldo.click® sea más memorable.
          Sube una foto que te represente y ayuda a otros usuarios a reconocerte
          fácilmente.
        </p>
      </div>
    </div>
    <div class="account--edit__form" aria-describedby="profile-photo-title">
      <UploadAvatar />
    </div>
  </section>
</template>

<script setup>
import UploadAvatar from "@/components/UploadAvatar.vue";
</script>
