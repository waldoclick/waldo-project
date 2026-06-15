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

      <!-- Step 3: Confirmation before generate -->
      <template v-else-if="currentStep === 3">
        <div class="lightbox--articles__header">
          <div class="lightbox--articles__header__title">Generar artículo</div>
          <div class="lightbox--articles__header__subtitle">
            Revisa la noticia seleccionada y genera el artículo con IA
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
          <button
            class="btn btn--primary"
            type="button"
            :disabled="loading"
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

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
  }>(),
  {},
);

const emit = defineEmits<{
  (event: "close" | "created"): void;
}>();

const client = useApiClient();
const { Swal } = useSweetAlert2();
const searchStore = useSearchStore();
const articlesStore = useArticlesStore();

// Max articles that can be selected at once.
// Kept low during AI testing — increase when ready for bulk creation.
const SELECTION_LIMIT = 1;

const currentStep = ref<1 | 2 | 3>(1);
const now = new Date();
const monthYear = now.toLocaleString("en-US", {
  month: "long",
  year: "numeric",
});
const query = ref(
  `latest industrial machinery Chile mining industry news ${monthYear}`,
);
const searchResults = ref<ITavilyResult[]>([]);
const selectedIndexes = ref<Set<number>>(new Set());
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
  currentStep.value = 3;
}

async function fetchFromApi(q: string) {
  const result = await client<{ sources: ITavilyResult[] }>(
    "/articles/sources",
    {
      method: "GET",
      params: { q },
    },
  );
  const news = result.sources || [];
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
  if (!item || loading.value) return;
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

    // Media ids extracted from the source page by the backend (1st = cover, rest = gallery)
    let cover: number[] = [];
    let gallery: number[] = [];

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
        const cached = articlesStore.getAICache(item.link)!.result as {
          title: string;
          header: string;
          body: string;
          seo_title: string;
          seo_description: string;
          cover?: number[];
          gallery?: number[];
        };
        parsed = {
          title: cached.title,
          header: cached.header,
          body: cached.body,
          seo_title: cached.seo_title,
          seo_description: cached.seo_description,
        };
        cover = cached.cover ?? [];
        gallery = cached.gallery ?? [];
      }
    }

    if (!parsed) {
      // 2. Call the domain generate endpoint — backend builds the prompt and picks the provider
      const result = await client<{
        text: string;
        cover?: number[];
        gallery?: number[];
      }>("/articles/generate", {
        method: "POST",
        body: {
          source: {
            title: item.title,
            link: item.link,
            snippet: bodyText,
            date: item.date ?? "",
          },
        },
      });

      // 3. Parse the JSON response — Cerebras is set to json_object mode so no markdown fences
      const rawText = result.text.trim();
      parsed = JSON.parse(rawText) as {
        title: string;
        header: string;
        body: string;
        seo_title: string;
        seo_description: string;
      };
      cover = result.cover ?? [];
      gallery = result.gallery ?? [];

      // Cache the parsed result (with media ids) for future use in this session
      articlesStore.setAICache(item.link, { ...parsed, cover, gallery });
    }

    // 4. Check for duplicate before creating
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
        await navigateTo(`/dashboard/articles/${docId}/edit`);
        handleClose();
      }
      return;
    }

    // 5. Create the article draft in Strapi — source_url always from Tavily, never from AI
    await client("/articles", {
      method: "POST",
      body: {
        data: {
          title: parsed!.title,
          header: parsed!.header,
          body: parsed!.body,
          seo_title: parsed!.seo_title,
          seo_description: parsed!.seo_description,
          source_url: item.link,
          is_published: false,
          ...(cover.length > 0 && { cover }),
          ...(gallery.length > 0 && { gallery }),
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
