<template>
  <Form v-slot="{ meta }" :validation-schema="schema" @submit="handleSubmit">
    <div class="form form--term">
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
          rows="8"
        />
        <ErrorMessage name="text" />
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

interface TermData {
  id?: number;
  documentId?: string;
  title?: string;
  text?: string;
  order?: number | null;
}

const props = defineProps<{
  term?: TermData | null;
}>();

const emit = defineEmits<{
  (e: "saved", term: TermData): void;
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
  order: yup.number().nullable().default(null),
});

const form = ref({
  title: "",
  text: "",
  order: null as number | null,
});

const isEditMode = computed(() =>
  Boolean(props.term?.documentId || props.term?.id),
);

const submitLabel = computed(() =>
  isEditMode.value ? "Actualizar Condicion de Uso" : "Crear Condicion de Uso",
);

const hydrateForm = () => {
  form.value = {
    title: props.term?.title || "",
    text: props.term?.text || "",
    order: props.term?.order ?? null,
  };
  lastHydratedId.value = props.term?.id || props.term?.documentId || null;
};

const handleSubmit = async (values: Record<string, unknown>) => {
  sending.value = true;

  try {
    const payload = {
      title: (values.title as string).trim(),
      text: (values.text as string).trim(),
      order: (values.order as number | null | undefined) ?? null,
    };

    if (isEditMode.value) {
      const termId = props.term?.id || Number(route.params.id);

      if (!termId) {
        await Swal.fire(
          "Error",
          "No se pudo identificar la Condicion para actualizar.",
          "error",
        );
        sending.value = false;
        return;
      }

      const response = await apiClient<{
        data: { id?: number; documentId?: string };
      }>(`/terms/${termId}`, {
        method: "PUT",
        body: { data: payload },
      });
      const responseData = response.data;
      const updatedTerm = {
        ...props.term,
        ...responseData,
        ...payload,
      };
      form.value = {
        title: payload.title,
        text: payload.text,
        order: payload.order,
      };
      emit("saved", updatedTerm as TermData);
      await Swal.fire(
        "Éxito",
        "Condicion actualizada correctamente.",
        "success",
      );
      const updatedId = responseData?.id || responseData?.documentId;
      if (updatedId) {
        router.push(`/terms/${updatedId}`);
      }
    } else {
      const lastResponse = (await apiClient("terms", {
        method: "GET",
        params: {
          sort: "order:desc",
          pagination: { pageSize: 1 },
        } as unknown as Record<string, unknown>,
      })) as { data: Array<{ order: number | null }> };
      const lastOrder =
        Array.isArray(lastResponse.data) && lastResponse.data[0]?.order != null
          ? lastResponse.data[0].order
          : 0;
      payload.order = lastOrder + 1;

      const response = await apiClient<{
        data: { id?: number; documentId?: string };
      }>("/terms", {
        method: "POST",
        body: { data: payload },
      });
      const createdData = response.data;
      emit("saved", (createdData as TermData) || ({} as TermData));
      await Swal.fire("Éxito", "Condicion creada correctamente.", "success");
      const createdId = createdData?.id || createdData?.documentId;
      if (createdId) {
        router.push(`/terms/${createdId}`);
      } else {
        router.push("/terms");
      }
    }
  } catch (error) {
    console.error("Error saving Condicion:", error);
    await Swal.fire("Error", "No se pudo guardar la Condicion.", "error");
  } finally {
    sending.value = false;
  }
};

watch(
  () => props.term,
  (value) => {
    if (!value || sending.value) return;
    const currentId = value.id || value.documentId || null;
    if (currentId && currentId === lastHydratedId.value) return;
    hydrateForm();
  },
  { immediate: true },
);
</script>
