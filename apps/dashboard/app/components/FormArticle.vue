<template>
  <Form v-slot="{ meta }" :validation-schema="schema" @submit="handleSubmit">
    <div class="form form--article">
      <div class="form__group">
        <label class="form__label" for="title">Título</label>
        <Field
          v-model="form.title"
          name="title"
          type="text"
          class="form__control"
        />
        <ErrorMessage name="title" />
      </div>

      <div class="form__group">
        <label class="form__label" for="header">Cabecera / Bajada</label>
        <Field
          v-model="form.header"
          as="textarea"
          name="header"
          class="form__control"
          rows="3"
        />
        <ErrorMessage name="header" />
      </div>

      <div class="form__group">
        <label class="form__label">Cuerpo</label>
        <TextareaArticle v-model="form.body" />
      </div>

      <div class="form__group">
        <label class="form__label" for="seo_title">Título SEO</label>
        <Field
          v-model="form.seo_title"
          name="seo_title"
          type="text"
          class="form__control"
        />
        <ErrorMessage name="seo_title" />
      </div>

      <div class="form__group">
        <label class="form__label" for="seo_description">Descripción SEO</label>
        <Field
          v-model="form.seo_description"
          as="textarea"
          name="seo_description"
          class="form__control"
          rows="3"
        />
        <ErrorMessage name="seo_description" />
      </div>

      <div class="form__send">
        <button
          :disabled="sending || !meta.valid"
          type="submit"
          class="btn btn--primary"
        >
          {{ submitLabel }}
        </button>
      </div>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useRoute, useRouter } from "vue-router";

interface ArticleData {
  id?: number;
  documentId?: string;
  title?: string;
  header?: string;
  body?: string;
  seo_title?: string;
  seo_description?: string;
}

const props = defineProps<{
  article?: ArticleData | null;
}>();

const emit = defineEmits<{
  (e: "saved", article: ArticleData): void;
}>();

const { Swal } = useSweetAlert2();
const router = useRouter();
const route = useRoute();
const strapi = useStrapi();

const sending = ref(false);
const lastHydratedId = ref<string | number | null>(null);

const schema = yup.object({
  title: yup.string().required("Título es requerido"),
  header: yup.string().optional(),
  body: yup.string().optional(),
  seo_title: yup.string().optional(),
  seo_description: yup.string().optional(),
});

const form = ref({
  title: "",
  header: "",
  body: "",
  seo_title: "",
  seo_description: "",
});

const isEditMode = computed(() =>
  Boolean(props.article?.documentId || props.article?.id),
);

const submitLabel = computed(() =>
  isEditMode.value ? "Actualizar artículo" : "Crear artículo",
);

const hydrateForm = () => {
  form.value = {
    title: props.article?.title || "",
    header: props.article?.header || "",
    body: props.article?.body || "",
    seo_title: props.article?.seo_title || "",
    seo_description: props.article?.seo_description || "",
  };
  lastHydratedId.value = props.article?.id || props.article?.documentId || null;
};

const handleSubmit = async (values: Record<string, unknown>) => {
  sending.value = true;

  try {
    const payload = {
      title: (values.title as string).trim(),
      header: (values.header as string)?.trim() || null,
      body: form.value.body?.trim() || null,
      seo_title: (values.seo_title as string)?.trim() || null,
      seo_description: (values.seo_description as string)?.trim() || null,
    };

    if (isEditMode.value) {
      const routeId = route.params.id;
      const documentId =
        props.article?.documentId ||
        (typeof routeId === "string" ? routeId : undefined);

      if (!documentId) {
        await Swal.fire(
          "Error",
          "No se pudo identificar el artículo para actualizar.",
          "error",
        );
        sending.value = false;
        return;
      }

      const response = await strapi.update(
        "articles",
        documentId,
        payload as unknown as Parameters<typeof strapi.update>[2],
      );
      const responseData = response.data as unknown as {
        id?: number;
        documentId?: string;
      };
      const updatedArticle = {
        ...props.article,
        ...responseData,
        ...payload,
      };
      form.value = {
        title: payload.title,
        header: payload.header || "",
        body: payload.body || "",
        seo_title: payload.seo_title || "",
        seo_description: payload.seo_description || "",
      };
      emit("saved", updatedArticle as ArticleData);
      await Swal.fire(
        "Éxito",
        "Artículo actualizado correctamente.",
        "success",
      );
      const updatedId = responseData?.documentId || responseData?.id;
      if (updatedId) {
        router.push(`/articles/${updatedId}`);
      }
    } else {
      const response = await strapi.create(
        "articles",
        payload as unknown as Parameters<typeof strapi.create>[1],
      );
      const createdData = response.data as unknown as {
        id?: number;
        documentId?: string;
      };
      emit("saved", (createdData as ArticleData) || ({} as ArticleData));
      await Swal.fire("Éxito", "Artículo creado correctamente.", "success");
      const createdId = createdData?.documentId || createdData?.id;
      if (createdId) {
        router.push(`/articles/${createdId}`);
      } else {
        router.push("/articles");
      }
    }
  } catch (error) {
    console.error("Error saving article:", error);
    await Swal.fire("Error", "No se pudo guardar el artículo.", "error");
  } finally {
    sending.value = false;
  }
};

watch(
  () => props.article,
  (value) => {
    if (!value || sending.value) return;
    const currentId = value.id || value.documentId || null;
    if (currentId && currentId === lastHydratedId.value) return;
    hydrateForm();
  },
  { immediate: true },
);
</script>
