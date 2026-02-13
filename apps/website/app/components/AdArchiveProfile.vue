<template>
  <section class="announcement announcement--showcase">
    <div v-if="posts.length === 0" class="announcement--showcase__empty">
      <EmptyState :message="`Usuario sin equipos para vender`" />
    </div>

    <div class="announcement--showcase__list">
      <!-- <CardAnnouncement
        v-for="ad in posts"
        :key="index"
        :all="ad"
      /> -->
    </div>

    <div class="announcement--showcase__paginate">
      <!-- <VuePaginate
        v-model="page"
        :page-count="pagination.last_page"
        :click-handler="handleChangePage"
        :prev-text="'Anterior'"
        :next-text="'Siguiente'"
        :container-class="'paginate'"
      /> -->
    </div>
  </section>
</template>

<script setup>
import CardAnnouncement from "@/components/CardAnnouncement.vue";
import EmptyState from "@/components/EmptyState.vue";
</script>
