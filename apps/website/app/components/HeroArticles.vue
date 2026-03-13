<template>
  <section class="hero hero--articles">
    <div class="hero--articles__container">
      <div class="hero--articles__breadcrumbs">
        <BreadcrumbsDefault :items="breadcrumbItems" />
      </div>
      <div class="hero--articles__title">
        <h1>Blog</h1>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import BreadcrumbsDefault from "@/components/BreadcrumbsDefault.vue";

const breadcrumbItems = [{ label: "Blog" }];
</script>
