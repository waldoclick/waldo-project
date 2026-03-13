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
            {{ loading ? "Buscando…" : "Siguiente →" }}
          </button>
        </div>
      </template>

      <!-- Step 2: Results table + single select -->
      <template v-else-if="currentStep === 2">
        <div class="lightbox--articles__header">
          <div class="lightbox--articles__header__title">
            Seleccionar noticia
          </div>
          <div class="lightbox--articles__header__subtitle">
            Selecciona la noticia que quieres convertir en artículo
          </div>
        </div>

        <div v-if="searchResults.length > 0" class="lightbox--articles__table">
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
              <span class="lightbox--articles__table__date">{{
                item.date
              }}</span>
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
            :disabled="selectedIndexes.size === 0"
            @click="goToPrompt"
          >
            Siguiente →
          </button>
        </div>
      </template>

      <!-- Step 3: Prompt editable + generate -->
      <template v-else-if="currentStep === 3">
        <div class="lightbox--articles__header">
          <div class="lightbox--articles__header__title">Generar artículo</div>
          <div class="lightbox--articles__header__subtitle">
            Edita el prompt si es necesario y genera el artículo con IA
          </div>
        </div>

        <div v-if="selectedItem" class="lightbox--articles__selected">
          <span class="lightbox--articles__selected__title">{{
            selectedItem.title
          }}</span>
          <a
            :href="selectedItem.link"
            target="_blank"
            rel="noopener noreferrer"
            class="lightbox--articles__selected__url"
            >{{ selectedItem.link }}</a
          >
        </div>

        <div class="lightbox--articles__field">
          <label for="lightbox-articles-prompt">Prompt</label>
          <textarea
            id="lightbox-articles-prompt"
            v-model="geminiPrompt"
            rows="12"
          />
        </div>

        <div class="lightbox--articles__actions">
          <button
            class="btn btn--secondary"
            type="button"
            @click="currentStep = 2"
          >
            ← Volver
          </button>
          <button
            class="btn btn--primary"
            type="button"
            :disabled="loading || !geminiPrompt.trim()"
            @click="handleGenerate"
          >
            {{ loading ? "Generando…" : "Generar artículo" }}
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

const DEFAULT_GEMINI_PROMPT = `You are an expert copywriter specializing in industrial machinery in Chile. Based on the following news article, generate a professional article in Spanish with this exact JSON format:
{
  "title": "article title (max 80 chars)",
  "header": "executive summary in 2-3 sentences",
  "body": "full body in Markdown (minimum 300 words)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "source_url": "source URL",
  "source_date": "source date"
}
Do not include anything outside the JSON.`;

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

// Max articles that can be selected at once.
// Kept low during AI testing — increase when ready for bulk creation.
const SELECTION_LIMIT = 1;

const currentStep = ref<1 | 2 | 3>(1);
const query = ref("maquinaria industrial Chile noticias");
const searchResults = ref<ITavilyResult[]>([]);
const selectedIndexes = ref<Set<number>>(new Set());
const geminiPrompt = ref(DEFAULT_GEMINI_PROMPT);
const loading = ref(false);

const selectedItem = computed<ITavilyResult | null>(() => {
  const [idx] = selectedIndexes.value;
  if (idx === undefined) return null;
  return searchResults.value[idx] ?? null;
});

// Lock body scroll when open, restore on close
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      currentStep.value = 1;
      searchResults.value = [];
      selectedIndexes.value = new Set();
      geminiPrompt.value = DEFAULT_GEMINI_PROMPT;
    } else {
      document.body.style.overflow = "";
    }
  },
);

function toggleRow(index: number) {
  const next = new Set(selectedIndexes.value);
  if (next.has(index)) {
    next.delete(index);
  } else {
    if (next.size >= SELECTION_LIMIT) {
      const [first] = next;
      if (first !== undefined) next.delete(first);
    }
    next.add(index);
  }
  selectedIndexes.value = next;
}

function goToPrompt() {
  const item = selectedItem.value;
  if (!item) return;
  // Append article context to the base prompt
  const context = `\n\nSource: ${item.link}\nDate: ${item.date}\nTitle: ${item.title}`;
  geminiPrompt.value = DEFAULT_GEMINI_PROMPT + context;
  currentStep.value = 3;
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

    if (isDismissed) return;

    if (isConfirmed) {
      searchResults.value = searchStore.getTavily(q)?.results ?? [];
      selectedIndexes.value = new Set();
      currentStep.value = 2;
      return;
    }
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

async function handleGenerate() {
  const item = selectedItem.value;
  if (!item || !geminiPrompt.value.trim() || loading.value) return;
  loading.value = true;
  try {
    // Ask Gemini to rewrite the article using the prompt (which includes the source URL/title)
    const result = await client<{ text: string }>("/ia/gemini", {
      method: "POST",
      body: { prompt: geminiPrompt.value },
    });

    const parsed = JSON.parse(result.text) as {
      title: string;
      header: string;
      body: string;
      keywords: string[];
      source_url: string;
      source_date: string;
    };

    // Create the article draft in Strapi with all generated fields
    await client("/articles?status=draft", {
      method: "POST",
      body: {
        data: {
          title: parsed.title,
          header: parsed.header,
          body: parsed.body,
          seo_title: parsed.title,
          seo_description: parsed.header,
          source_url: parsed.source_url || item.link,
        },
      },
    });

    emit("created");
    handleClose();
  } catch (e) {
    console.error("[LightBoxArticles] Generate error:", e);
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  document.body.style.overflow = "";
  emit("close");
}
</script>
