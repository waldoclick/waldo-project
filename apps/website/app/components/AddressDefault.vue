<template>
  <div class="address address--default">
    <div class="address--default__group">
      <span class="address--default__eyebrow">Correo electrónico</span>
      <a href="mailto:contacto@waldo.click" class="address--default__email">
        <IconMail :size="17" class="address--default__email__icon" />
        contacto@waldo.click
      </a>
    </div>
    <div class="address--default__group">
      <span class="address--default__eyebrow">Redes sociales</span>
      <div class="address--default__social">
        <a
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          href="https://www.facebook.com/profile.php?id=100070086861335"
          class="address--default__social__link"
        >
          <IconFacebook :size="17" />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          href="https://www.instagram.com/waldo.click"
          class="address--default__social__link"
        >
          <IconInstagram :size="17" />
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          href="https://www.linkedin.com/company/waldoclick"
          class="address--default__social__link"
        >
          <IconLinkedin :size="17" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Facebook as IconFacebook,
  Instagram as IconInstagram,
  Mail as IconMail,
  Linkedin as IconLinkedin,
} from "lucide-vue-next";
</script>
