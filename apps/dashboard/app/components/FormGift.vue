<template>
  <Form v-slot="{ meta }" :validation-schema="schema" @submit="handleSubmit">
    <div class="form form--gift">
      <div class="form__group">
        <label class="form__label" for="gift-quantity">Cantidad</label>
        <Field
          id="gift-quantity"
          v-model="form.quantity"
          name="quantity"
          type="number"
          min="1"
          class="form__control"
        />
        <ErrorMessage name="quantity" />
      </div>

      <div class="form__group form__group--upload">
        <label class="form__label">Usuario</label>
        <Field v-model="form.userId" name="userId" type="hidden" />
        <InputAutocomplete
          v-model="form.userId"
          :options="userOptions"
          :loading="usersLoading"
          placeholder="Buscar por nombre..."
          @search="searchUsers"
        />
        <ErrorMessage name="userId" />
      </div>

      <div class="form__send">
        <button
          :disabled="sending || !meta.valid"
          type="submit"
          class="btn btn--primary"
        >
          {{ sending ? "Enviando..." : "Regalar" }}
        </button>
      </div>
    </div>
  </Form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Field, Form, ErrorMessage } from "vee-validate";
import * as yup from "yup";

interface IAuthUser {
  id: number;
  firstname: string;
  lastname: string;
}

const props = defineProps<{
  endpoint: string;
  label: string;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "gifted"): void;
}>();

const { Swal } = useSweetAlert2();
const apiClient = useApiClient();

const users = ref<IAuthUser[]>([]);
const usersLoading = ref(false);
const sending = ref(false);
const searchQuery = ref("");

const form = ref({
  quantity: "1",
  userId: "",
});

const schema = yup.object({
  quantity: yup
    .number()
    .typeError("Cantidad es requerida")
    .min(1, "Mínimo 1")
    .required("Cantidad es requerida"),
  userId: yup.string().required("Selecciona un usuario"),
});

const userOptions = computed(() =>
  users.value.map((u) => ({
    label: `${u.firstname} ${u.lastname}`.trim() || "(sin nombre)",
    value: String(u.id),
  })),
);

async function searchUsers(q: string) {
  if (!q || q.trim().length < 2) {
    users.value = [];
    return;
  }
  usersLoading.value = true;
  try {
    const params: Record<string, unknown> = {
      filters: {
        $and: [
          { role: { type: { $eq: "authenticated" } } },
          {
            $or: [
              { firstname: { $containsi: q } },
              { lastname: { $containsi: q } },
              { username: { $containsi: q } },
            ],
          },
        ],
      },
      fields: ["id", "firstname", "lastname", "username"],
      pagination: { pageSize: 20 },
    };
    const response = (await apiClient("users", {
      method: "GET",
      params: params as unknown as Record<string, unknown>,
    })) as IAuthUser[] | { data: IAuthUser[] };
    users.value = (
      Array.isArray(response)
        ? response
        : ((response as { data: IAuthUser[] }).data ?? [])
    ) as IAuthUser[];
  } catch (e) {
    console.error("[FormGift] searchUsers error:", e);
    users.value = [];
  } finally {
    usersLoading.value = false;
  }
}

async function handleSubmit() {
  const quantity = Number(form.value.quantity);
  const userId = Number(form.value.userId);

  const { isConfirmed } = await Swal.fire({
    title: "¿Confirmar regalo?",
    text: `Vas a regalar ${quantity} ${props.label} al usuario seleccionado.`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, regalar",
    cancelButtonText: "Cancelar",
  });

  if (!isConfirmed) return;

  sending.value = true;
  try {
    await apiClient(`/${props.endpoint}/gift`, {
      method: "POST",
      body: { userId, quantity },
    });
    emit("gifted");
  } catch (e) {
    console.error("[FormGift] gift error:", e);
    await Swal.fire("Error", "No se pudo enviar el regalo.", "error");
  } finally {
    sending.value = false;
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      form.value = { quantity: "1", userId: "" };
      users.value = [];
      searchQuery.value = "";
    }
  },
  { immediate: true },
);
</script>
