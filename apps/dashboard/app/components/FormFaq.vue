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
const apiClient = useApiClient();

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

const handleSubmit = async (values: Record<string, unknown>) => {
  sending.value = true;

  try {
    const payload = {
      title: (values.title as string).trim(),
      text: (values.text as string).trim(),
      featured: Boolean(values.featured),
    };

    if (isEditMode.value) {
      const routeId = route.params.id;
      const documentId =
        props.faq?.documentId ||
        (typeof routeId === "string" ? routeId : undefined);
      let faqId = props.faq?.id;

      if (!faqId && documentId) {
        const lookupResponse = (await apiClient("faqs", {
          method: "GET",
          params: {
            filters: { documentId: { $eq: documentId } },
            pagination: { pageSize: 1 },
          } as unknown as Record<string, unknown>,
        })) as { data: Array<{ id: number }> };
        const lookupData = Array.isArray(lookupResponse.data)
          ? (lookupResponse.data as Array<{ id: number }>)
          : [];
        faqId = lookupData[0]?.id;
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

      const response = await apiClient<{
        data: { id?: number; documentId?: string };
      }>(`/faqs/${faqId}`, {
        method: "PUT",
        body: { data: payload },
      });
      const responseData = response.data;
      const updatedFaq = {
        ...props.faq,
        ...responseData,
        ...payload,
      };
      form.value = {
        title: payload.title,
        text: payload.text,
        featured: payload.featured,
      };
      emit("saved", updatedFaq as FaqData);
      await Swal.fire("Éxito", "FAQ actualizado correctamente.", "success");
      const updatedId = responseData?.documentId || responseData?.id;
      if (updatedId) {
        router.push(`/faqs/${updatedId}`);
      }
    } else {
      const response = await apiClient<{
        data: { id?: number; documentId?: string };
      }>("/faqs", {
        method: "POST",
        body: { data: payload },
      });
      const createdData = response.data;
      emit("saved", (createdData as FaqData) || ({} as FaqData));
      await Swal.fire("Éxito", "FAQ creado correctamente.", "success");
      const createdId = createdData?.documentId || createdData?.id;
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
