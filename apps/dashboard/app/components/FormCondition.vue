<template>
  <Form v-slot="{ meta }" :validation-schema="schema" @submit="handleSubmit">
    <div class="form form--condition">
      <div class="form-group">
        <label class="form-label" for="name">Nombre</label>
        <Field
          v-model="form.name"
          name="name"
          type="text"
          class="form-control"
        />
        <ErrorMessage name="name" />
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
import { useSlugify } from "@/composables/useSlugify";

interface ConditionData {
  id?: number;
  documentId?: string;
  name?: string;
}

const props = defineProps<{
  condition?: ConditionData | null;
}>();

const emit = defineEmits<{
  (e: "saved", condition: ConditionData): void;
}>();

const { Swal } = useSweetAlert2();
const router = useRouter();
const route = useRoute();
const strapi = useStrapi();
const { toSlug } = useSlugify();

const sending = ref(false);
const lastHydratedId = ref<string | number | null>(null);

const schema = yup.object({
  name: yup.string().required("Nombre es requerido"),
});

const form = ref({
  name: "",
});

const isEditMode = computed(() =>
  Boolean(props.condition?.documentId || props.condition?.id),
);

const submitLabel = computed(() =>
  isEditMode.value ? "Actualizar condición" : "Crear condición",
);

const hydrateForm = () => {
  form.value = {
    name: props.condition?.name || "",
  };
  lastHydratedId.value =
    props.condition?.id || props.condition?.documentId || null;
};

const handleSubmit = async (values: any) => {
  sending.value = true;

  try {
    const payload = {
      name: values.name.trim(),
      slug: toSlug(values.name),
    };

    if (isEditMode.value) {
      const routeId = route.params.id;
      const documentId =
        props.condition?.documentId ||
        (typeof routeId === "string" ? routeId : undefined);
      let conditionId = props.condition?.id;

      if (!conditionId && documentId) {
        const lookupResponse = await strapi.find("conditions", {
          filters: { documentId: { $eq: documentId } },
          pagination: { pageSize: 1 },
        });
        const lookup = Array.isArray(lookupResponse.data)
          ? lookupResponse.data[0]
          : null;
        conditionId = lookup?.id;
      }

      if (!conditionId) {
        await Swal.fire(
          "Error",
          "No se pudo identificar la condición para actualizar.",
          "error",
        );
        sending.value = false;
        return;
      }

      const response = await strapi.update("conditions", conditionId, payload);
      const updatedCondition = {
        ...props.condition,
        ...response.data,
        name: payload.name,
      };
      form.value = {
        name: payload.name,
      };
      emit("saved", updatedCondition);
      await Swal.fire(
        "Éxito",
        "Condición actualizada correctamente.",
        "success",
      );
      const updatedId = updatedCondition?.documentId || updatedCondition?.id;
      if (updatedId) {
        router.push(`/condiciones/${updatedId}`);
      }
    } else {
      const response = await strapi.create("conditions", payload);
      emit("saved", response.data || {});
      await Swal.fire("Éxito", "Condición creada correctamente.", "success");
      const createdId = response.data?.documentId || response.data?.id;
      if (createdId) {
        router.push(`/condiciones/${createdId}`);
      } else {
        router.push("/condiciones");
      }
    }
  } catch (error) {
    console.error("Error saving condition:", error);
    await Swal.fire("Error", "No se pudo guardar la condición.", "error");
  } finally {
    sending.value = false;
  }
};

watch(
  () => props.condition,
  (value) => {
    if (!value || sending.value) return;
    const currentId = value.id || value.documentId || null;
    if (currentId && currentId === lastHydratedId.value) return;
    hydrateForm();
  },
  { immediate: true },
);
</script>
