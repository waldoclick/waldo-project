<template>
  <article class="card card--howto">
    <div class="card--howto__info" :class="{ 'is-revert': revert }">
      <div class="card--howto__info__image">
        <NuxtImg
          loading="lazy"
          decoding="async"
          class="howto--default__steps__card__info__image"
          :alt="title"
          :title="title"
          :src="image"
        />
      </div>
      <div class="card--howto__info__content">
        <h3 class="card--howto__info__content__title">
          {{ title }}
        </h3>
        <div class="card--howto__info__content__description">
          {{ description }}
        </div>
        <div class="card--howto__info__content__button">
          <nuxt-link
            :title="textButton"
            to="/anunciar"
            class="btn btn--primary btn--announcement"
          >
            <span>{{ textButton }}</span>
          </nuxt-link>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    image: string;
    textButton: string;
    revert: boolean | string;
    showLine: boolean | string;
  }>(),
  {
    title: "",
    description: "",
    image: "",
    textButton: "",
  },
);
</script>
