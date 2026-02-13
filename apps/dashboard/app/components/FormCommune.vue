<template>
  <Form v-slot="{ meta }" :validation-schema="schema" @submit="handleSubmit">
    <div class="form form--commune">
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
        <label class="form-label" for="region">Región</label>
        <Field
          v-model="form.region"
          as="select"
          name="region"
          class="form-control"
        >
          <option value="">Seleccione una región</option>
          <option v-for="region in regions" :key="region.id" :value="region.id">
            {{ region.name }}
          </option>
        </Field>
        <ErrorMessage name="region" />
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
import { ref, computed, onMounted, watch } from "vue";
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useRouter, useRoute } from "vue-router";
import { useSlugify } from "@/composables/useSlugify";

interface RegionOption {
  id: number;
  name: string;
}

interface CommuneData {
  id?: number;
  documentId?: string;
  name?: string;
  region?: { id?: number };
}

const props = defineProps<{
  commune?: CommuneData | null;
}>();

const emit = defineEmits<{
  (e: "saved", commune: CommuneData): void;
}>();

const { Swal } = useSweetAlert2();
const router = useRouter();
const route = useRoute();
const strapi = useStrapi();
const { toSlug } = useSlugify();

const regions = ref<RegionOption[]>([]);
const sending = ref(false);
const lastHydratedId = ref<string | number | null>(null);

const schema = yup.object({
  name: yup.string().required("Nombre es requerido"),
  region: yup
    .number()
    .typeError("Región es requerida")
    .required("Región es requerida"),
});

const form = ref({
  name: "",
  region: "",
});

const isEditMode = computed(() =>
  Boolean(props.commune?.documentId || props.commune?.id),
);

const submitLabel = computed(() =>
  isEditMode.value ? "Actualizar comuna" : "Crear comuna",
);

const normalizeRegionId = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "";
  return Number(value);
};

const hydrateForm = () => {
  form.value = {
    name: props.commune?.name || "",
    region: props.commune?.region?.id?.toString() ?? "",
  };
  lastHydratedId.value = props.commune?.id || props.commune?.documentId || null;
};

const fetchRegions = async () => {
  try {
    const response = await strapi.find("regions", {
      pagination: { pageSize: 200 },
      sort: "name:asc",
    });
    regions.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching regions:", error);
    regions.value = [];
  }
};

const handleSubmit = async (values: any) => {
  sending.value = true;

  try {
    const payload = {
      name: values.name.trim(),
      region: normalizeRegionId(values.region),
      slug: toSlug(values.name),
    };

    if (!payload.region) {
      await Swal.fire("Error", "Región es requerida.", "error");
      sending.value = false;
      return;
    }

    if (isEditMode.value) {
      const routeId = route.params.id;
      const documentId =
        props.commune?.documentId ||
        (typeof routeId === "string" ? routeId : undefined);
      let communeId = props.commune?.id;

      if (!communeId && documentId) {
        const lookupResponse = await strapi.find("communes", {
          filters: { documentId: { $eq: documentId } },
          pagination: { pageSize: 1 },
        });
        const lookup = Array.isArray(lookupResponse.data)
          ? lookupResponse.data[0]
          : null;
        communeId = lookup?.id;
      }

      if (!communeId) {
        await Swal.fire(
          "Error",
          "No se pudo identificar la comuna para actualizar.",
          "error",
        );
        sending.value = false;
        return;
      }

      const response = await strapi.update("communes", communeId, payload);
      const updatedCommune = {
        ...props.commune,
        ...response.data,
        name: payload.name,
        region: { id: payload.region },
      };
      form.value = {
        name: payload.name,
        region: payload.region.toString(),
      };
      emit("saved", updatedCommune);
      await Swal.fire("Éxito", "Comuna actualizada correctamente.", "success");
      const updatedId = updatedCommune?.documentId || updatedCommune?.id;
      if (updatedId) {
        router.push(`/comunas/${updatedId}`);
      }
    } else {
      const response = await strapi.create("communes", payload);
      emit("saved", response.data || {});
      await Swal.fire("Éxito", "Comuna creada correctamente.", "success");
      const createdId = response.data?.documentId || response.data?.id;
      if (createdId) {
        router.push(`/comunas/${createdId}`);
      } else {
        router.push("/comunas");
      }
    }
  } catch (error) {
    console.error("Error saving commune:", error);
    await Swal.fire("Error", "No se pudo guardar la comuna.", "error");
  } finally {
    sending.value = false;
  }
};

watch(
  () => props.commune,
  (value) => {
    if (!value || sending.value) return;
    const currentId = value.id || value.documentId || null;
    if (currentId && currentId === lastHydratedId.value) return;
    hydrateForm();
  },
  { immediate: true },
);

onMounted(async () => {
  await fetchRegions();
});
</script>
