<template>
  <Form v-slot="{ meta }" :validation-schema="schema" @submit="handleSubmit">
    <div class="form form--pack">
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

      <div class="form__group">
        <label class="form__label" for="price">Precio</label>
        <Field
          v-model="form.price"
          name="price"
          type="number"
          class="form__control"
        />
        <ErrorMessage name="price" />
      </div>

      <div class="form__group">
        <label class="form__label" for="total_days">Duración (días)</label>
        <Field
          v-model="form.total_days"
          name="total_days"
          type="number"
          class="form__control"
        />
        <ErrorMessage name="total_days" />
      </div>

      <div class="form__group">
        <label class="form__label" for="total_ads">Cantidad de anuncios</label>
        <Field
          v-model="form.total_ads"
          name="total_ads"
          type="number"
          class="form__control"
        />
        <ErrorMessage name="total_ads" />
      </div>

      <div class="form__group">
        <label class="form__label" for="total_features">Destacados</label>
        <Field
          v-model="form.total_features"
          name="total_features"
          type="number"
          class="form__control"
        />
        <ErrorMessage name="total_features" />
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

export interface PackData {
  id?: number;
  documentId?: string;
  name?: string;
  price?: number;
  total_days?: number;
  total_ads?: number;
  total_features?: number;
}

const props = defineProps<{
  pack?: PackData | null;
}>();

const emit = defineEmits<{
  (e: "saved", pack: PackData): void;
}>();

const { Swal } = useSweetAlert2();
const router = useRouter();
const route = useRoute();
const apiClient = useApiClient();

const sending = ref(false);
const lastHydratedId = ref<string | number | null>(null);

const schema = yup.object({
  name: yup.string().required("Nombre es requerido"),
  price: yup
    .number()
    .typeError("Precio es requerido")
    .required("Precio es requerido"),
  total_days: yup
    .number()
    .typeError("Duración es requerida")
    .required("Duración es requerida"),
  total_ads: yup
    .number()
    .typeError("Cantidad de anuncios es requerida")
    .required("Cantidad de anuncios es requerida"),
  total_features: yup
    .number()
    .typeError("Destacados es requerido")
    .required("Destacados es requerido"),
});

const form = ref({
  name: "",
  price: "",
  total_days: "",
  total_ads: "",
  total_features: "",
});

const isEditMode = computed(() =>
  Boolean(props.pack?.documentId || props.pack?.id),
);

const submitLabel = computed(() =>
  isEditMode.value ? "Actualizar pack" : "Crear pack",
);

const toNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
};

const hydrateForm = () => {
  form.value = {
    name: props.pack?.name || "",
    price: props.pack?.price?.toString() ?? "",
    total_days: props.pack?.total_days?.toString() ?? "",
    total_ads: props.pack?.total_ads?.toString() ?? "",
    total_features: props.pack?.total_features?.toString() ?? "",
  };
  lastHydratedId.value = props.pack?.id || props.pack?.documentId || null;
};

const handleSubmit = async (values: Record<string, unknown>) => {
  sending.value = true;

  try {
    const payload = {
      name: (values.name as string).trim(),
      price: toNumber(values.price),
      total_days: toNumber(values.total_days),
      total_ads: toNumber(values.total_ads),
      total_features: toNumber(values.total_features),
    };

    if (
      payload.price === null ||
      payload.total_days === null ||
      payload.total_ads === null ||
      payload.total_features === null
    ) {
      await Swal.fire(
        "Error",
        "Complete todos los campos requeridos.",
        "error",
      );
      sending.value = false;
      return;
    }

    if (isEditMode.value) {
      const routeId = route.params.id;
      const documentId =
        props.pack?.documentId ||
        (typeof routeId === "string" ? routeId : undefined);
      let packId = props.pack?.id;

      if (!packId && documentId) {
        const lookupResponse = (await apiClient("ad-packs", {
          method: "GET",
          params: {
            filters: { documentId: { $eq: documentId } },
            pagination: { pageSize: 1 },
          } as unknown as Record<string, unknown>,
        })) as { data: Array<{ id: number }> };
        const lookupData = Array.isArray(lookupResponse.data)
          ? (lookupResponse.data as Array<{ id: number }>)
          : [];
        packId = lookupData[0]?.id;
      }

      if (!packId) {
        await Swal.fire(
          "Error",
          "No se pudo identificar el pack para actualizar.",
          "error",
        );
        sending.value = false;
        return;
      }

      const response = await apiClient<{
        data: { id?: number; documentId?: string };
      }>(`/ad-packs/${packId}`, {
        method: "PUT",
        body: { data: payload },
      });
      const responseData = response.data;
      const updatedPack = {
        ...props.pack,
        ...responseData,
        ...payload,
      };
      form.value = {
        name: payload.name,
        price: payload.price.toString(),
        total_days: payload.total_days.toString(),
        total_ads: payload.total_ads.toString(),
        total_features: payload.total_features.toString(),
      };
      emit("saved", updatedPack as PackData);
      await Swal.fire("Éxito", "Pack actualizado correctamente.", "success");
      const updatedId = responseData?.documentId || responseData?.id;
      if (updatedId) {
        router.push(`/maintenance/packs/${updatedId}`);
      }
    } else {
      const response = await apiClient<{
        data: { id?: number; documentId?: string };
      }>("/ad-packs", {
        method: "POST",
        body: { data: payload },
      });
      const createdData = response.data;
      emit("saved", (createdData as PackData) || ({} as PackData));
      await Swal.fire("Éxito", "Pack creado correctamente.", "success");
      const createdId = createdData?.documentId || createdData?.id;
      if (createdId) {
        router.push(`/maintenance/packs/${createdId}`);
      } else {
        router.push("/maintenance/packs");
      }
    }
  } catch (error) {
    console.error("Error saving pack:", error);
    await Swal.fire("Error", "No se pudo guardar el pack.", "error");
  } finally {
    sending.value = false;
  }
};

watch(
  () => props.pack,
  (value) => {
    if (!value || sending.value) return;
    const currentId = value.id || value.documentId || null;
    if (currentId && currentId === lastHydratedId.value) return;
    hydrateForm();
  },
  { immediate: true },
);
</script>
