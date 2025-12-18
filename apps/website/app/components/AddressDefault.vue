<template>
  <div class="address address--default">
    <div class="address--default__wrapper">
      <div class="address--default__email">
        <label class="address--default__label">Correo eléctronico</label>
        <a href="mailto:contacto@waldo.click" class="email">
          <IconMail :size="16" class="icon-mail" />
          contacto@waldo.click
        </a>
      </div>
      <div class="address--default__rrss">
        <label class="address--default__label">Redes sociales</label>
        <span class="address--default__rrss__links">
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.facebook.com/profile.php?id=100070086861335"
          >
            <IconFacebook :size="16" class="icon-facebook" />
            Facebook
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.instagram.com/waldo.click"
          >
            <IconInstagram :size="16" class="icon-instagram" />
            Instagram
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.linkedin.com/company/waldoclick"
          >
            <IconLinkedin :size="16" class="icon-linkedin" />
            LinkedIn
          </a>
        </span>
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
