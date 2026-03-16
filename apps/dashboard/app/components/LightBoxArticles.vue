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

      <!-- Step 3: Prompt only -->
      <template v-else-if="currentStep === 3">
        <div class="lightbox--articles__header">
          <div class="lightbox--articles__header__title">Generar artículo</div>
          <div class="lightbox--articles__header__subtitle">
            Edita el prompt si es necesario y genera el artículo con IA
          </div>
        </div>

        <div class="lightbox--articles__field">
          <label for="lightbox-articles-prompt">Prompt</label>
          <textarea
            id="lightbox-articles-prompt"
            v-model="geminiPrompt"
            rows="14"
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
            {{ loading ? "Generando…" : "Crear" }}
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
import { useArticlesStore } from "@/stores/articles.store";

const DEFAULT_GEMINI_PROMPT = `You are an industrial news editor writing for a blog about industrial assets and productive sectors.

You will receive the title, content, source URL, and publication date of a real news article.

Your task is to rewrite the news as an original article suitable for a professional audience interested in industrial sectors.

Requirements:

1. The article MUST be written in Spanish.

2. Rewrite the information completely in your own words.
   Do NOT copy sentences from the original text.

3. Preserve the main facts and meaning of the news but improve clarity and readability.

4. Structure the article as:

* title
* header (2–3 sentence introduction)
* body (4–6 paragraphs)

5. The body MUST be written using **Markdown only**.

* Use paragraphs separated by line breaks.
* Highlight important keywords using **bold**.
* DO NOT use HTML tags.

6. The response MUST be **valid JSON only**. Do not include explanations, markdown wrappers, or additional text.

JSON format:

{
"title": "string",
"header": "string",
"body": "string",
"seo_title": "string",
"seo_description": "string"
}`;

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
const searchStore = import.meta.client
  ? useSearchStore()
  : ({} as ReturnType<typeof useSearchStore>);
const articlesStore = import.meta.client
  ? useArticlesStore()
  : ({} as ReturnType<typeof useArticlesStore>);

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
  geminiPrompt.value = DEFAULT_GEMINI_PROMPT;
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
    // 1. Use Tavily's content (already fetched server-side during search) — no browser fetch needed
    const bodyText = item.snippet?.trim() ?? "";

    if (!bodyText) {
      await Swal.fire({
        title: "Sin contenido",
        text: "Tavily no devolvió contenido para este artículo. Intenta con otra noticia.",
        icon: "error",
      });
      loading.value = false;
      return;
    }

    // Check AI cache first
    let parsed: {
      title: string;
      header: string;
      body: string;
      seo_title: string;
      seo_description: string;
    } | null = null;

    if (articlesStore.hasAICache(item.link)) {
      const { isConfirmed, isDismissed } = await Swal.fire({
        title: "Respuesta guardada",
        text: "Ya generamos un artículo para esta noticia. ¿Quieres usar la respuesta guardada o generar una nueva?",
        icon: "question",
        showConfirmButton: true,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Usar guardada",
        denyButtonText: "Generar nueva",
      });
      if (isDismissed) {
        loading.value = false;
        return;
      }
      if (isConfirmed) {
        parsed = articlesStore.getAICache(item.link)!.result;
      }
    }

    if (!parsed) {
      // 2. Build the final prompt by appending article context after the instructions
      const fullPrompt =
        geminiPrompt.value.trim() +
        "\n\n---\n\n" +
        `Title: ${item.title}\n` +
        `Source URL: ${item.link}\n` +
        `Date: ${item.date ?? ""}\n` +
        `Content:\n${bodyText}`;

      // 3. Send to Groq
      const result = await client<{ text: string }>("/ia/groq", {
        method: "POST",
        body: { prompt: fullPrompt },
      });

      // 4. Parse the JSON response — Groq is set to json_object mode so no markdown fences
      const rawText = result.text.trim();
      parsed = JSON.parse(rawText) as {
        title: string;
        header: string;
        body: string;
        seo_title: string;
        seo_description: string;
      };

      // Cache the parsed result for future use in this session
      articlesStore.setAICache(item.link, parsed);
    }

    // 5. Check for duplicate before creating
    type ArticleListResponse = { data: { documentId: string }[] };
    const existing = await client<ArticleListResponse>("/articles", {
      params: {
        filters: { source_url: { $eq: item.link } },
      } as Record<string, unknown>,
    });

    if (existing.data && existing.data.length > 0) {
      const docId = existing.data[0]!.documentId;
      const dupResult = await Swal.fire({
        title: "Esta noticia ya existe",
        text: "Ya existe un artículo creado con esta URL de origen.",
        icon: "warning",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Ir al artículo",
        cancelButtonText: "Cancelar",
      });
      if (dupResult.isConfirmed) {
        await navigateTo(`/articles/edit/${docId}`);
        handleClose();
      }
      return;
    }

    // 6. Create the article draft in Strapi — source_url always from Tavily, never from AI
    await client("/articles?status=draft", {
      method: "POST",
      body: {
        data: {
          title: parsed!.title,
          header: parsed!.header,
          body: parsed!.body,
          seo_title: parsed!.seo_title,
          seo_description: parsed!.seo_description,
          source_url: item.link,
        },
      },
    });

    emit("created");
    handleClose();
  } catch (e) {
    console.error("[LightBoxArticles] Generate error:", e);
    await Swal.fire(
      "Error",
      "No se pudo generar el artículo. Intenta nuevamente.",
      "error",
    );
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  document.body.style.overflow = "";
  emit("close");
}
</script>
