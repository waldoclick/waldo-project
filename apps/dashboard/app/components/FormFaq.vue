<template>
  <Form v-slot="{ meta }" :validation-schema="schema" @submit="handleSubmit">
    <div class="form form--faq">
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
        <label class="form__label" for="text">Contenido</label>
        <Field
          v-model="form.text"
          as="textarea"
          name="text"
          class="form__control"
          rows="5"
        />
        <ErrorMessage name="text" />
      </div>

      <div class="form__group form__group--inline">
        <label class="form__label" for="featured">Destacado</label>
        <Field
          v-model="form.featured"
          name="featured"
          type="checkbox"
          class="form__checkbox"
        />
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

interface FaqData {
  id?: number;
  documentId?: string;
  title?: string;
  text?: string;
  featured?: boolean;
}

const props = defineProps<{
  faq?: FaqData | null;
}>();

const emit = defineEmits<{
  (e: "saved", faq: FaqData): void;
}>();

const { Swal } = useSweetAlert2();
const router = useRouter();
const route = useRoute();
const strapi = useStrapi();

const sending = ref(false);
const lastHydratedId = ref<string | number | null>(null);

const schema = yup.object({
  title: yup.string().required("Título es requerido"),
  text: yup.string().required("Contenido es requerido"),
  featured: yup.boolean().default(false),
});

const form = ref({
  title: "",
  text: "",
  featured: false,
});

const isEditMode = computed(() =>
  Boolean(props.faq?.documentId || props.faq?.id),
);

const submitLabel = computed(() =>
  isEditMode.value ? "Actualizar FAQ" : "Crear FAQ",
);

const hydrateForm = () => {
  form.value = {
    title: props.faq?.title || "",
    text: props.faq?.text || "",
    featured: Boolean(props.faq?.featured),
  };
  lastHydratedId.value = props.faq?.id || props.faq?.documentId || null;
};

const handleSubmit = async (values: any) => {
  sending.value = true;

  try {
    const payload = {
      title: values.title.trim(),
      text: values.text.trim(),
      featured: Boolean(values.featured),
    };

    if (isEditMode.value) {
      const routeId = route.params.id;
      const documentId =
        props.faq?.documentId ||
        (typeof routeId === "string" ? routeId : undefined);
      let faqId = props.faq?.id;

      if (!faqId && documentId) {
        const lookupResponse = await strapi.find("faqs", {
          filters: { documentId: { $eq: documentId } },
          pagination: { pageSize: 1 },
        });
        const lookup = Array.isArray(lookupResponse.data)
          ? lookupResponse.data[0]
          : null;
        faqId = lookup?.id;
      }

      if (!faqId) {
        await Swal.fire(
          "Error",
          "No se pudo identificar el FAQ para actualizar.",
          "error",
        );
        sending.value = false;
        return;
      }

      const response = await strapi.update("faqs", faqId, payload);
      const updatedFaq = {
        ...props.faq,
        ...response.data,
        ...payload,
      };
      form.value = {
        title: payload.title,
        text: payload.text,
        featured: payload.featured,
      };
      emit("saved", updatedFaq);
      await Swal.fire("Éxito", "FAQ actualizado correctamente.", "success");
      const updatedId = updatedFaq?.documentId || updatedFaq?.id;
      if (updatedId) {
        router.push(`/faqs/${updatedId}`);
      }
    } else {
      const response = await strapi.create("faqs", payload);
      emit("saved", response.data || {});
      await Swal.fire("Éxito", "FAQ creado correctamente.", "success");
      const createdId = response.data?.documentId || response.data?.id;
      if (createdId) {
        router.push(`/faqs/${createdId}`);
      } else {
        router.push("/faqs");
      }
    }
  } catch (error) {
    console.error("Error saving FAQ:", error);
    await Swal.fire("Error", "No se pudo guardar el FAQ.", "error");
  } finally {
    sending.value = false;
  }
};

watch(
  () => props.faq,
  (value) => {
    if (!value || sending.value) return;
    const currentId = value.id || value.documentId || null;
    if (currentId && currentId === lastHydratedId.value) return;
    hydrateForm();
  },
  { immediate: true },
);
</script>
