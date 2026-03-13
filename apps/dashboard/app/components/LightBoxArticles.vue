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

      <!-- Step 1: Search -->
      <template v-if="currentStep === 1">
        <div class="lightbox--articles__title">Buscar noticias</div>
        <div class="lightbox--articles__field">
          <label for="lightbox-articles-query">Consulta de búsqueda</label>
          <textarea id="lightbox-articles-query" v-model="query" rows="3" />
        </div>
        <div class="lightbox--articles__actions">
          <button
            class="btn btn--primary"
            type="button"
            :disabled="loading"
            @click="handleSearch"
          >
            Buscar
          </button>
        </div>
        <div
          v-if="searchResults.length > 0"
          class="lightbox--articles__results"
        >
          <button
            v-for="(item, index) in searchResults"
            :key="index"
            class="lightbox--articles__result"
            type="button"
            @click="handleSelectArticle(item)"
          >
            <span class="lightbox--articles__result__title">{{
              item.title
            }}</span>
            <span class="lightbox--articles__result__meta"
              >{{ item.date }} · {{ item.source }}</span
            >
          </button>
        </div>
        <div
          v-else-if="hasSearched && searchResults.length === 0"
          class="lightbox--articles__empty"
        >
          No se encontraron resultados para esta búsqueda.
        </div>
      </template>

      <!-- Step 2: Generate -->
      <template v-else-if="currentStep === 2">
        <div class="lightbox--articles__title">Generar artículo</div>
        <div v-if="selectedArticle" class="lightbox--articles__article">
          <span class="lightbox--articles__article__title">{{
            selectedArticle.title
          }}</span>
          <a
            :href="selectedArticle.url"
            target="_blank"
            rel="noopener noreferrer"
            class="lightbox--articles__article__url"
            >{{ selectedArticle.url }}</a
          >
          <span class="lightbox--articles__article__date">{{
            selectedArticle.date
          }}</span>
        </div>
        <div class="lightbox--articles__field">
          <label for="lightbox-articles-prompt">Prompt para Gemini</label>
          <textarea
            id="lightbox-articles-prompt"
            v-model="geminiPrompt"
            rows="8"
          />
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
            class="btn btn--primary"
            type="button"
            :disabled="loading"
            @click="handleGenerate"
          >
            Generar artículo
          </button>
        </div>
      </template>

      <!-- Step 3: Result -->
      <template v-else-if="currentStep === 3">
        <div class="lightbox--articles__title">Resultado</div>
        <div v-if="generatedArticle" class="lightbox--articles__generated">
          <h3 class="lightbox--articles__generated__heading">
            {{ generatedArticle.title }}
          </h3>
          <p class="lightbox--articles__generated__header">
            {{ generatedArticle.header }}
          </p>
          <div class="lightbox--articles__body" v-html="renderedBody" />
          <div class="lightbox--articles__keywords">
            <span
              v-for="(keyword, index) in generatedArticle.keywords"
              :key="index"
              class="lightbox--articles__keywords__tag"
              >{{ keyword }}</span
            >
          </div>
          <div class="lightbox--articles__meta">
            <a
              :href="generatedArticle.source_url"
              target="_blank"
              rel="noopener noreferrer"
              >{{ generatedArticle.source_url }}</a
            >
            · {{ generatedArticle.source_date }}
          </div>
        </div>
        <div class="lightbox--articles__actions">
          <button
            class="btn btn--secondary"
            type="button"
            @click="currentStep = 2"
          >
            ← Volver
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { X as IconX } from "lucide-vue-next";

interface ITavilyNewsResult {
  title: string;
  link: string;
  snippet: string;
  date: string;
  source: string;
}

interface IGeneratedArticle {
  title: string;
  header: string;
  body: string;
  keywords: string[];
  source_url: string;
  source_date: string;
}

const DEFAULT_GEMINI_PROMPT = `Eres un redactor experto en maquinaria industrial para Chile. A partir de la siguiente noticia, genera un artículo profesional en español con este formato JSON exacto:
{
  "title": "título del artículo (max 80 chars)",
  "header": "resumen ejecutivo en 2-3 oraciones",
  "body": "cuerpo completo en Markdown (mínimo 300 palabras)",
  "keywords": ["palabra1", "palabra2", "palabra3"],
  "source_url": "URL de la fuente",
  "source_date": "fecha de la fuente"
}
No incluyas nada fuera del JSON.`;

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
  }>(),
  {},
);

const emit = defineEmits<{
  (event: "close"): void;
}>();

const currentStep = ref<1 | 2 | 3>(1);
const query = ref("maquinaria industrial Chile noticias");
const searchResults = ref<ITavilyNewsResult[]>([]);
const selectedArticle = ref<{
  title: string;
  url: string;
  date: string;
  html: string;
} | null>(null);
const geminiPrompt = ref(DEFAULT_GEMINI_PROMPT);
const generatedArticle = ref<IGeneratedArticle | null>(null);
const loading = ref(false);
const hasSearched = ref(false);

// When lightbox opens, reset step and results (but keep query and prompt)
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      currentStep.value = 1;
      searchResults.value = [];
      generatedArticle.value = null;
      hasSearched.value = false;
    }
  },
);

// When advancing to step 2, append article context to the prompt
watch(currentStep, (step) => {
  if (step === 2 && selectedArticle.value) {
    const articleContext = `\n\nFuente: ${selectedArticle.value.url}\nFecha: ${selectedArticle.value.date}\nTítulo: ${selectedArticle.value.title}`;
    geminiPrompt.value = DEFAULT_GEMINI_PROMPT + articleContext;
  }
});

const renderedBody = computed(() => {
  if (!generatedArticle.value?.body) return "";
  return generatedArticle.value.body
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
});

async function handleSearch() {
  if (!query.value.trim() || loading.value) return;
  loading.value = true;
  try {
    const result = await $fetch<{ news: ITavilyNewsResult[] }>(
      "/api/search/tavily",
      {
        method: "POST",
        body: { query: query.value.trim(), num: 10 },
      },
    );
    searchResults.value = result.news || [];
    hasSearched.value = true;
  } catch (e) {
    console.error("[LightBoxArticles] Tavily error:", e);
    searchResults.value = [];
    hasSearched.value = true;
  } finally {
    loading.value = false;
  }
}

function handleSelectArticle(item: ITavilyNewsResult) {
  if (loading.value) return;
  selectedArticle.value = {
    title: item.title,
    url: item.link,
    date: item.date,
    html: "",
  };
  currentStep.value = 2;
}

async function handleGenerate() {
  if (!geminiPrompt.value.trim() || loading.value) return;
  loading.value = true;
  try {
    const result = await $fetch<{ text: string }>("/api/ia/gemini", {
      method: "POST",
      body: { prompt: geminiPrompt.value },
    });
    const parsed = JSON.parse(result.text) as IGeneratedArticle;
    generatedArticle.value = parsed;
    currentStep.value = 3;
  } catch (e) {
    console.error("[LightBoxArticles] Gemini error:", e);
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  emit("close");
}
</script>
