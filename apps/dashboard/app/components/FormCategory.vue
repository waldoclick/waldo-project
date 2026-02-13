<template>
  <Form v-slot="{ meta }" :validation-schema="schema" @submit="handleSubmit">
    <div class="form form--category">
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

      <div class="form-group">
        <label class="form-label" for="color">Color</label>
        <Field
          v-model="form.color"
          name="color"
          type="text"
          class="form-control"
          placeholder="#FFFFFF"
        />
        <ErrorMessage name="color" />
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

interface CategoryData {
  id?: number;
  documentId?: string;
  name?: string;
  slug?: string;
  color?: string;
  icon?: { id?: number; url?: string };
}

const props = defineProps<{
  category?: CategoryData | null;
}>();

const emit = defineEmits<{
  (e: "saved", category: CategoryData): void;
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
  color: yup.string().required("Color es requerido"),
});

const form = ref({
  name: "",
  color: "",
});

const isEditMode = computed(() =>
  Boolean(props.category?.documentId || props.category?.id),
);

const submitLabel = computed(() =>
  isEditMode.value ? "Actualizar categoría" : "Crear categoría",
);

const hydrateForm = () => {
  form.value = {
    name: props.category?.name || "",
    color: props.category?.color || "",
  };
  lastHydratedId.value =
    props.category?.id || props.category?.documentId || null;
};

const handleSubmit = async (values: any) => {
  sending.value = true;

  try {
    const payload = {
      name: values.name.trim(),
      color: values.color.trim(),
      slug: toSlug(values.name),
    };

    if (isEditMode.value) {
      const routeId = route.params.id;
      const documentId =
        props.category?.documentId ||
        (typeof routeId === "string" ? routeId : undefined);
      let categoryId = props.category?.id;

      if (!categoryId && documentId) {
        const lookupResponse = await strapi.find("categories", {
          filters: { documentId: { $eq: documentId } },
          pagination: { pageSize: 1 },
          populate: ["icon"],
        });
        const lookup = Array.isArray(lookupResponse.data)
          ? lookupResponse.data[0]
          : null;
        categoryId = lookup?.id;
      }

      if (!categoryId) {
        await Swal.fire(
          "Error",
          "No se pudo identificar la categoría para actualizar.",
          "error",
        );
        sending.value = false;
        return;
      }

      const response = await strapi.update("categories", categoryId, payload);
      const updatedCategory = {
        ...props.category,
        ...response.data,
        name: payload.name,
        color: payload.color,
      };
      form.value = {
        name: payload.name,
        color: payload.color,
      };
      emit("saved", updatedCategory);
      await Swal.fire(
        "Éxito",
        "Categoría actualizada correctamente.",
        "success",
      );
      const updatedId = updatedCategory?.documentId || updatedCategory?.id;
      if (updatedId) {
        router.push(`/categorias/${updatedId}`);
      }
    } else {
      const response = await strapi.create("categories", payload);
      emit("saved", response.data || {});
      await Swal.fire("Éxito", "Categoría creada correctamente.", "success");
      const createdId = response.data?.documentId || response.data?.id;
      if (createdId) {
        router.push(`/categorias/${createdId}`);
      } else {
        router.push("/categorias");
      }
    }
  } catch (error) {
    console.error("Error saving category:", error);
    await Swal.fire("Error", "No se pudo guardar la categoría.", "error");
  } finally {
    sending.value = false;
  }
};

watch(
  () => props.category,
  (value) => {
    if (!value || sending.value) return;
    const currentId = value.id || value.documentId || null;
    if (currentId && currentId === lastHydratedId.value) return;
    hydrateForm();
  },
  { immediate: true },
);
</script>
