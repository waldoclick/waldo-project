<template>
  <div class="filter filter--default">
    <div class="filter--default__wrapper">
      <!-- Sort Filter -->
      <div
        v-if="sortOptions && sortOptions.length > 0"
        class="filter--default__sort"
      >
        <button
          class="filter--default__button"
          @click="isSortOpen = !isSortOpen"
        >
          <ArrowUpDown class="filter--default__button__icon" />
          <span>{{ currentSortLabel }}</span>
          <ChevronDown class="filter--default__button__arrow" />
        </button>
        <div v-if="isSortOpen" class="filter--default__dropdown" @click.stop>
          <button
            v-for="option in sortOptions"
            :key="option.value"
            class="filter--default__dropdown__item"
            :class="{
              'filter--default__dropdown__item--active':
                modelValue.sortBy === option.value,
            }"
            @click="handleSortChange(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Page Size Filter -->
      <div class="filter--default__pagesize">
        <button
          class="filter--default__button"
          @click="isPageSizeOpen = !isPageSizeOpen"
        >
          <List class="filter--default__button__icon" />
          <span>{{ modelValue.pageSize }} pag.</span>
          <ChevronDown class="filter--default__button__arrow" />
        </button>
        <div
          v-if="isPageSizeOpen"
          class="filter--default__dropdown"
          @click.stop
        >
          <button
            v-for="size in pageSizes"
            :key="size"
            class="filter--default__dropdown__item"
            :class="{
              'filter--default__dropdown__item--active':
                modelValue.pageSize === size,
            }"
            @click="handlePageSizeChange(size)"
          >
            {{ size }} pag.
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { ArrowUpDown, ChevronDown, List } from "lucide-vue-next";

interface SortOption {
  value: string;
  label: string;
}

const props = defineProps<{
  modelValue: {
    sortBy: string;
    pageSize: number;
  };
  sortOptions?: SortOption[];
  pageSizes?: number[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: { sortBy: string; pageSize: number }];
}>();

const isSortOpen = ref(false);
const isPageSizeOpen = ref(false);

const currentSortLabel = computed(() => {
  const option = props.sortOptions?.find(
    (opt) => opt.value === props.modelValue.sortBy,
  );
  return option?.label || props.modelValue.sortBy;
});

const handleSortChange = (value: string) => {
  emit("update:modelValue", {
    ...props.modelValue,
    sortBy: value,
  });
  isSortOpen.value = false;
};

const handlePageSizeChange = (size: number) => {
  emit("update:modelValue", {
    ...props.modelValue,
    pageSize: size,
  });
  isPageSizeOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".filter--default")) {
    isSortOpen.value = false;
    isPageSizeOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
