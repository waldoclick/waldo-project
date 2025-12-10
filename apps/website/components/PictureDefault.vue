<template>
  <NuxtPicture
    src="/images/bg-hero-home.webp"
    alt="Anuncia o Busca Activos industriales, rápido y fácil en Waldo.click®"
    width="1200"
    height="600"
    format="webp"
    loading="eager"
    fetchpriority="high"
  />
</template>

<script setup>
const { getImage } = useImage();
const imageUrl = getImage("/images/bg-hero-home.webp", {
  width: 1200,
  height: 600,
  format: "webp",
  quality: 80,
}).src;

// Solo agregar el preload si la URL es válida
if (imageUrl) {
  useHead({
    link: [
      {
        rel: "preload",
        as: "image",
        href: imageUrl,
        type: "image/webp",
      },
    ],
  });
}
</script>
