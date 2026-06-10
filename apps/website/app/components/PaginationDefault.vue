<template>
  <div class="pagination pagination--default">
    <div class="pagination--default__info">
      <span v-if="totalRecords !== undefined">
        Mostrando {{ startRecord }} - {{ endRecord }} de
        {{ totalRecords }} registros
      </span>
      <span v-else> Página {{ currentPage }} de {{ totalPages }} </span>
    </div>
    <div v-if="totalPages > 1" class="pagination--default__controls">
      <button
        class="pagination--default__button"
        :class="{ 'pagination--default__button--disabled': currentPage === 1 }"
        :disabled="currentPage === 1"
        @click="$emit('pageChange', currentPage - 1)"
      >
        <ChevronLeft class="pagination--default__button__icon" />
        <span class="pagination--default__button__text">Anterior</span>
      </button>

      <template v-for="(page, index) in pageNumbers" :key="index">
        <div v-if="page === 'ellipsis'" class="pagination--default__ellipsis">
          <MoreHorizontal class="pagination--default__ellipsis__icon" />
        </div>
        <button
          v-else
          class="pagination--default__button pagination--default__button--page"
          :class="{
            'pagination--default__button--active': currentPage === page,
          }"
          @click="$emit('pageChange', page)"
        >
          {{ page }}
        </button>
      </template>

      <button
        class="pagination--default__button"
        :class="{
          'pagination--default__button--disabled': currentPage === totalPages,
        }"
        :disabled="currentPage === totalPages"
        @click="$emit('pageChange', currentPage + 1)"
      >
        <span class="pagination--default__button__text">Siguiente</span>
        <ChevronRight class="pagination--default__button__icon" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-vue-next";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
  totalRecords?: number;
  pageSize?: number;
}>();

const startRecord = computed(() => {
  if (!props.totalRecords || !props.pageSize) return 0;
  return (props.currentPage - 1) * props.pageSize + 1;
});

const endRecord = computed(() => {
  if (!props.totalRecords || !props.pageSize) return 0;
  const end = props.currentPage * props.pageSize;
  return end > props.totalRecords ? props.totalRecords : end;
});

defineEmits<{
  pageChange: [page: number];
}>();

const pageNumbers = computed(() => {
  if (props.totalPages <= 1) {
    return [];
  }
  const pages: (number | "ellipsis")[] = [];
  const maxVisible = 5;

  if (props.totalPages <= maxVisible) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (props.currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(props.totalPages);
    } else if (props.currentPage >= props.totalPages - 2) {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = props.totalPages - 3; i <= props.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = props.currentPage - 1; i <= props.currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(props.totalPages);
    }
  }

  return pages;
});
</script>
