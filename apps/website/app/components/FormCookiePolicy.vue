<template>
  <Form v-slot="{ meta }" :validation-schema="schema" @submit="handleSubmit">
    <div class="form form--cookie">
      <div class="form__group">
        <label class="form__label" for="title">Título</label>
        <Field v-model="form.title" name="title" type="text" class="form__control" />
        <ErrorMessage name="title" />
      </div>

      <div class="form__group">
        <label class="form__label" for="text">Contenido</label>
        <Field v-model="form.text" as="textarea" name="text" class="form__control" rows="8" />
        <ErrorMessage name="text" />
      </div>

      <div class="form__send">
        <button :disabled="sending || !meta.valid" type="submit" class="btn btn--primary">
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

export interface CookiePolicyData {
  id?: number;
  documentId?: string;
  title?: string;
  text?: string;
  order?: number | null;
}

const props = defineProps<{
  cookiePolicy?: CookiePolicyData | null;
}>();

const emit = defineEmits<{
  (e: "saved", cookiePolicy: CookiePolicyData): void;
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

const isEditMode = computed(() => Boolean(props.cookiePolicy?.documentId || props.cookiePolicy?.id));

const submitLabel = computed(() =>
  isEditMode.value ? "Actualizar Política de Cookies" : "Crear Política de Cookies",
);

const hydrateForm = () => {
  form.value = {
    title: props.cookiePolicy?.title || "",
    text: props.cookiePolicy?.text || "",
    order: props.cookiePolicy?.order ?? null,
  };
  lastHydratedId.value = props.cookiePolicy?.id || props.cookiePolicy?.documentId || null;
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
      const routeId = route.params.id;
      const documentId =
        props.cookiePolicy?.documentId || (typeof routeId === "string" ? routeId : undefined);

      if (!documentId) {
        await Swal.fire("Error", "No se pudo identificar la Política de Cookies para actualizar.", "error");
        sending.value = false;
        return;
      }

      const response = await apiClient<{ data: { id?: number; documentId?: string } }>(
        `/cookie-policies/${documentId}`,
        { method: "PUT", body: { data: payload } },
      );
      const responseData = response.data;
      const updatedCookiePolicy = { ...props.cookiePolicy, ...responseData, ...payload };
      form.value = { title: payload.title, text: payload.text, order: payload.order };
      emit("saved", updatedCookiePolicy as CookiePolicyData);
      await Swal.fire("Éxito", "Política de Cookies actualizada correctamente.", "success");
      const updatedId = responseData?.id || responseData?.documentId;
      if (updatedId) {
        router.push(`/dashboard/maintenance/cookies/${updatedId}`);
      }
    } else {
      const lastResponse = (await apiClient("cookie-policies", {
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

      const response = await apiClient<{ data: { id?: number; documentId?: string } }>(
        "/cookie-policies",
        { method: "POST", body: { data: payload } },
      );
      const createdData = response.data;
      emit("saved", (createdData as CookiePolicyData) || ({} as CookiePolicyData));
      await Swal.fire("Éxito", "Política de Cookies creada correctamente.", "success");
      const createdId = createdData?.id || createdData?.documentId;
      if (createdId) {
        router.push(`/dashboard/maintenance/cookies/${createdId}`);
      } else {
        router.push("/dashboard/maintenance/cookies");
      }
    }
  } catch (error) {
    console.error("Error saving Política de Cookies:", error);
    await Swal.fire("Error", "No se pudo guardar la Política de Cookies.", "error");
  } finally {
    sending.value = false;
  }
};

watch(
  () => props.cookiePolicy,
  (value) => {
    if (!value || sending.value) return;
    const currentId = value.id || value.documentId || null;
    if (currentId && currentId === lastHydratedId.value) return;
    hydrateForm();
  },
  { immediate: true },
);
</script>
