<template>
  <Form v-slot="{ meta }" :validation-schema="schema" @submit="handleSubmit">
    <div class="form form--region">
      <div class="form__group">
        <label class="form__label" for="name">Nombre</label>
        <Field
          v-model="form.name"
          name="name"
          type="text"
          class="form__control"
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

interface RegionData {
  id?: number;
  documentId?: string;
  name?: string;
}

const props = defineProps<{
  region?: RegionData | null;
}>();

const emit = defineEmits<{
  (e: "saved", region: RegionData): void;
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
  Boolean(props.region?.documentId || props.region?.id),
);

const submitLabel = computed(() =>
  isEditMode.value ? "Actualizar región" : "Crear región",
);

const hydrateForm = () => {
  form.value = {
    name: props.region?.name || "",
  };
  lastHydratedId.value = props.region?.id || props.region?.documentId || null;
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
        props.region?.documentId ||
        (typeof routeId === "string" ? routeId : undefined);
      let regionId = props.region?.id;

      if (!regionId && documentId) {
        const lookupResponse = await strapi.find("regions", {
          filters: { documentId: { $eq: documentId } },
          pagination: { pageSize: 1 },
        } as Record<string, unknown>);
        const lookupData = Array.isArray(lookupResponse.data)
          ? (lookupResponse.data as Array<{ id: number }>)
          : [];
        regionId = lookupData[0]?.id;
      }

      if (!regionId) {
        await Swal.fire(
          "Error",
          "No se pudo identificar la región para actualizar.",
          "error",
        );
        sending.value = false;
        return;
      }

      const response = await strapi.update(
        "regions",
        regionId,
        payload as unknown as Parameters<typeof strapi.update>[2],
      );
      const responseData = response.data as unknown as {
        id?: number;
        documentId?: string;
      };
      const updatedRegion = {
        ...props.region,
        ...responseData,
        name: payload.name,
      };
      form.value = {
        name: payload.name,
      };
      emit("saved", updatedRegion as RegionData);
      await Swal.fire("Éxito", "Región actualizada correctamente.", "success");
      const updatedId = responseData?.documentId || responseData?.id;
      if (updatedId) {
        router.push(`/regiones/${updatedId}`);
      }
    } else {
      const response = await strapi.create(
        "regions",
        payload as unknown as Parameters<typeof strapi.create>[1],
      );
      const createdData = response.data as unknown as {
        id?: number;
        documentId?: string;
      };
      emit("saved", (createdData as RegionData) || ({} as RegionData));
      await Swal.fire("Éxito", "Región creada correctamente.", "success");
      const createdId = createdData?.documentId || createdData?.id;
      if (createdId) {
        router.push(`/regiones/${createdId}`);
      } else {
        router.push("/regiones");
      }
    }
  } catch (error) {
    console.error("Error saving region:", error);
    await Swal.fire("Error", "No se pudo guardar la región.", "error");
  } finally {
    sending.value = false;
  }
};

watch(
  () => props.region,
  (value) => {
    if (!value || sending.value) return;
    const currentId = value.id || value.documentId || null;
    if (currentId && currentId === lastHydratedId.value) return;
    hydrateForm();
  },
  { immediate: true },
);
</script>
