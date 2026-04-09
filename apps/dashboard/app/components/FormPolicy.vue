<template>
  <Form v-slot="{ meta }" :validation-schema="schema" @submit="handleSubmit">
    <div class="form form--policy">
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

export interface PolicyData {
  id?: number;
  documentId?: string;
  title?: string;
  text?: string;
  order?: number | null;
}

const props = defineProps<{
  policy?: PolicyData | null;
}>();

const emit = defineEmits<{
  (e: "saved", policy: PolicyData): void;
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
  Boolean(props.policy?.documentId || props.policy?.id),
);

const submitLabel = computed(() =>
  isEditMode.value ? "Actualizar Politica" : "Crear Politica",
);

const hydrateForm = () => {
  form.value = {
    title: props.policy?.title || "",
    text: props.policy?.text || "",
    order: props.policy?.order ?? null,
  };
  lastHydratedId.value = props.policy?.id || props.policy?.documentId || null;
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
      const policyId = props.policy?.id || Number(route.params.id);

      if (!policyId) {
        await Swal.fire(
          "Error",
          "No se pudo identificar la Politica para actualizar.",
          "error",
        );
        sending.value = false;
        return;
      }

      const response = await apiClient<{
        data: { id?: number; documentId?: string };
      }>(`/policies/${policyId}`, {
        method: "PUT",
        body: { data: payload },
      });
      const responseData = response.data;
      const updatedPolicy = {
        ...props.policy,
        ...responseData,
        ...payload,
      };
      form.value = {
        title: payload.title,
        text: payload.text,
        order: payload.order,
      };
      emit("saved", updatedPolicy as PolicyData);
      await Swal.fire(
        "Éxito",
        "Politica actualizada correctamente.",
        "success",
      );
      const updatedId = responseData?.id || responseData?.documentId;
      if (updatedId) {
        router.push(`/policies/${updatedId}`);
      }
    } else {
      const lastResponse = (await apiClient("policies", {
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
      }>("/policies", {
        method: "POST",
        body: { data: payload },
      });
      const createdData = response.data;
      emit("saved", (createdData as PolicyData) || ({} as PolicyData));
      await Swal.fire("Éxito", "Politica creada correctamente.", "success");
      const createdId = createdData?.id || createdData?.documentId;
      if (createdId) {
        router.push(`/policies/${createdId}`);
      } else {
        router.push("/maintenance/policies");
      }
    }
  } catch (error) {
    console.error("Error saving Politica:", error);
    await Swal.fire("Error", "No se pudo guardar la Politica.", "error");
  } finally {
    sending.value = false;
  }
};

watch(
  () => props.policy,
  (value) => {
    if (!value || sending.value) return;
    const currentId = value.id || value.documentId || null;
    if (currentId && currentId === lastHydratedId.value) return;
    hydrateForm();
  },
  { immediate: true },
);
</script>
