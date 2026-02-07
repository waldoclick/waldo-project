<template>
  <Form v-slot="{ meta }" :validation-schema="schema" @submit="handleSubmit">
    <div class="form form--pack">
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
        <label class="form-label" for="text">Texto</label>
        <Field
          v-model="form.text"
          name="text"
          type="text"
          class="form-control"
        />
        <ErrorMessage name="text" />
      </div>

      <div class="form-group">
        <label class="form-label" for="description">Descripción</label>
        <Field
          v-model="form.description"
          as="textarea"
          name="description"
          class="form-control"
          rows="4"
        />
        <ErrorMessage name="description" />
      </div>

      <div class="form-group">
        <label class="form-label" for="price">Precio</label>
        <Field
          v-model="form.price"
          name="price"
          type="number"
          class="form-control"
        />
        <ErrorMessage name="price" />
      </div>

      <div class="form-group">
        <label class="form-label" for="total_days">Duración (días)</label>
        <Field
          v-model="form.total_days"
          name="total_days"
          type="number"
          class="form-control"
        />
        <ErrorMessage name="total_days" />
      </div>

      <div class="form-group">
        <label class="form-label" for="total_ads">Cantidad de anuncios</label>
        <Field
          v-model="form.total_ads"
          name="total_ads"
          type="number"
          class="form-control"
        />
        <ErrorMessage name="total_ads" />
      </div>

      <div class="form-group">
        <label class="form-label" for="total_features">Destacados</label>
        <Field
          v-model="form.total_features"
          name="total_features"
          type="number"
          class="form-control"
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

interface PackData {
  id?: number;
  documentId?: string;
  name?: string;
  text?: string;
  description?: string;
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
const strapi = useStrapi();

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
  text: "",
  description: "",
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
    text: props.pack?.text || "",
    description: props.pack?.description || "",
    price: props.pack?.price?.toString() ?? "",
    total_days: props.pack?.total_days?.toString() ?? "",
    total_ads: props.pack?.total_ads?.toString() ?? "",
    total_features: props.pack?.total_features?.toString() ?? "",
  };
  lastHydratedId.value = props.pack?.id || props.pack?.documentId || null;
};

const handleSubmit = async (values: any) => {
  sending.value = true;

  try {
    const payload = {
      name: values.name.trim(),
      text: values.text?.trim() || "",
      description: values.description?.trim() || "",
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
        const lookupResponse = await strapi.find("ad-packs", {
          filters: { documentId: { $eq: documentId } },
          pagination: { pageSize: 1 },
        });
        const lookup = Array.isArray(lookupResponse.data)
          ? lookupResponse.data[0]
          : null;
        packId = lookup?.id;
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

      const response = await strapi.update("ad-packs", packId, payload);
      const updatedPack = {
        ...props.pack,
        ...response.data,
        ...payload,
      };
      form.value = {
        name: payload.name,
        text: payload.text,
        description: payload.description,
        price: payload.price.toString(),
        total_days: payload.total_days.toString(),
        total_ads: payload.total_ads.toString(),
        total_features: payload.total_features.toString(),
      };
      emit("saved", updatedPack);
      await Swal.fire("Éxito", "Pack actualizado correctamente.", "success");
      const updatedId = updatedPack?.documentId || updatedPack?.id;
      if (updatedId) {
        router.push(`/packs/${updatedId}`);
      }
    } else {
      const response = await strapi.create("ad-packs", payload);
      emit("saved", response.data || {});
      await Swal.fire("Éxito", "Pack creado correctamente.", "success");
      const createdId = response.data?.documentId || response.data?.id;
      if (createdId) {
        router.push(`/packs/${createdId}`);
      } else {
        router.push("/packs");
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
