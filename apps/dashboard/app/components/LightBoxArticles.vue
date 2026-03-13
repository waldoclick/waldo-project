<template>
  <div :class="{ 'is-open': isOpen }" class="lightbox lightbox--articles">
    <div class="lightbox--articles__backdrop" @click="handleClose" />
    <div class="lightbox--articles__box" role="dialog" aria-modal="true">
      <button
        title="Cerrar"
        type="button"
        class="lightbox__button"
        @click="handleClose"
      >
        <IconX :size="24" />
      </button>

      <!-- Step 1: Search form -->
      <template v-if="currentStep === 1">
        <div class="lightbox--articles__header">
          <div class="lightbox--articles__header__title">Buscar noticias</div>
          <div class="lightbox--articles__header__subtitle">
            Ingresa una consulta para buscar noticias relevantes
          </div>
        </div>
        <div class="lightbox--articles__field">
          <label for="lightbox-articles-query">Consulta de búsqueda</label>
          <textarea id="lightbox-articles-query" v-model="query" rows="3" />
        </div>
        <div
          class="lightbox--articles__actions lightbox--articles__actions--end"
        >
          <button
            class="btn btn--primary"
            type="button"
            :disabled="loading || !query.trim()"
            @click="handleSearch"
          >
            {{ loading ? "Buscando..." : "Siguiente →" }}
          </button>
        </div>
      </template>

      <!-- Step 2: Results table + multi-select -->
      <template v-else-if="currentStep === 2">
        <div class="lightbox--articles__header">
          <div class="lightbox--articles__header__title">
            Seleccionar noticias
          </div>
          <div class="lightbox--articles__header__subtitle">
            Selecciona una o más noticias para crear borradores de artículo
          </div>
        </div>

        <div v-if="searchResults.length > 0" class="lightbox--articles__table">
          <div class="lightbox--articles__table__head">
            <div
              class="lightbox--articles__table__cell lightbox--articles__table__cell--check"
            >
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="someSelected && !allSelected"
                @change="toggleAll"
              />
            </div>
            <div class="lightbox--articles__table__cell">Título</div>
            <div
              class="lightbox--articles__table__cell lightbox--articles__table__cell--date"
            >
              Fecha
            </div>
          </div>
          <div
            v-for="(item, index) in searchResults"
            :key="index"
            class="lightbox--articles__table__row"
            :class="{ 'is-selected': selectedIndexes.has(index) }"
            @click="toggleRow(index)"
          >
            <div
              class="lightbox--articles__table__cell lightbox--articles__table__cell--check"
            >
              <input
                type="checkbox"
                :checked="selectedIndexes.has(index)"
                @click.stop
                @change="toggleRow(index)"
              />
            </div>
            <div
              class="lightbox--articles__table__cell lightbox--articles__table__cell--title"
            >
              <span class="lightbox--articles__table__title">{{
                item.title
              }}</span>
              <a
                :href="item.link"
                target="_blank"
                rel="noopener noreferrer"
                class="lightbox--articles__table__url"
                @click.stop
                >{{ item.link }}</a
              >
            </div>
            <div
              class="lightbox--articles__table__cell lightbox--articles__table__cell--date"
            >
              {{ item.date }}
            </div>
          </div>
        </div>

        <div v-else class="lightbox--articles__empty">
          No se encontraron resultados para esta búsqueda.
        </div>

        <div class="lightbox--articles__actions">
          <button
            class="btn btn--secondary"
            type="button"
            @click="currentStep = 1"
          >
            ← Volver
          </button>
          <button
            v-if="searchResults.length > 0"
            class="btn btn--primary"
            type="button"
            :disabled="loading || selectedIndexes.size === 0"
            @click="handleCreate"
          >
            {{ loading ? "Creando..." : `Crear (${selectedIndexes.size})` }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { X as IconX } from "lucide-vue-next";
import { useSearchStore, type ITavilyResult } from "@/stores/search.store";

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
  }>(),
  {},
);

const emit = defineEmits<{
  (event: "close" | "created"): void;
}>();

const client = useStrapiClient();
const { Swal } = useSweetAlert2();
const searchStore = useSearchStore();

const currentStep = ref<1 | 2>(1);
const query = ref("maquinaria industrial Chile noticias");
const searchResults = ref<ITavilyResult[]>([]);
const selectedIndexes = ref<Set<number>>(new Set());
const loading = ref(false);

// Lock body scroll when open, restore on close
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      currentStep.value = 1;
      searchResults.value = [];
      selectedIndexes.value = new Set();
    } else {
      document.body.style.overflow = "";
    }
  },
);

const allSelected = computed(
  () =>
    searchResults.value.length > 0 &&
    selectedIndexes.value.size === searchResults.value.length,
);

const someSelected = computed(() => selectedIndexes.value.size > 0);

function toggleAll() {
  selectedIndexes.value = allSelected.value
    ? new Set()
    : new Set(searchResults.value.map((_, i) => i));
}

function toggleRow(index: number) {
  const next = new Set(selectedIndexes.value);
  if (next.has(index)) {
    next.delete(index);
  } else {
    next.add(index);
  }
  selectedIndexes.value = next;
}

async function fetchFromApi(q: string) {
  const result = await client<{ news: ITavilyResult[] }>("/search/tavily", {
    method: "POST",
    body: { query: q, num: 10 },
  });
  const news = result.news || [];
  searchStore.setTavily(q, news);
  return news;
}

async function handleSearch() {
  const q = query.value.trim();
  if (!q || loading.value) return;

  // If cache exists, ask user whether to reuse or re-fetch
  if (searchStore.hasTavily(q)) {
    const { isConfirmed, isDismissed } = await Swal.fire({
      title: "Resultados guardados",
      text: `Ya tenemos resultados para "${q}". ¿Quieres usar los datos guardados o hacer una nueva búsqueda?`,
      icon: "question",
      showConfirmButton: true,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Usar guardados",
      denyButtonText: "Nueva búsqueda",
    });

    if (isDismissed) return; // clicked outside — do nothing

    if (isConfirmed) {
      // Use cached results
      searchResults.value = searchStore.getTavily(q)?.results ?? [];
      selectedIndexes.value = new Set();
      currentStep.value = 2;
      return;
    }
    // isDenied → fall through to re-fetch
  }

  loading.value = true;
  try {
    searchResults.value = await fetchFromApi(q);
    selectedIndexes.value = new Set();
    currentStep.value = 2;
  } catch (e) {
    console.error("[LightBoxArticles] Tavily error:", e);
    searchResults.value = [];
    currentStep.value = 2;
  } finally {
    loading.value = false;
  }
}

async function handleCreate() {
  if (selectedIndexes.value.size === 0 || loading.value) return;
  loading.value = true;
  try {
    const selected = [...selectedIndexes.value]
      .map((i) => searchResults.value[i])
      .filter((item): item is ITavilyResult => item !== undefined);
    await Promise.all(
      selected.map((item) =>
        client("/articles?status=draft", {
          method: "POST",
          body: {
            data: {
              title: item.title,
              source_url: item.link,
            },
          },
        }),
      ),
    );
    emit("created");
    handleClose();
  } catch (e) {
    console.error("[LightBoxArticles] Create error:", e);
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  document.body.style.overflow = "";
  emit("close");
}
</script>
