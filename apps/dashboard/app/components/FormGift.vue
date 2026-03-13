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

      <div class="form__group">
        <label class="form__label" for="gift-search">Buscar usuario</label>
        <input
          id="gift-search"
          v-model="userSearch"
          type="text"
          class="form__control"
          placeholder="Nombre..."
          autocomplete="off"
        />
      </div>

      <div class="form__group">
        <label class="form__label" for="gift-user">Usuario</label>
        <Field
          id="gift-user"
          v-model="form.userId"
          name="userId"
          as="select"
          class="form__control"
        >
          <option value="">
            {{
              usersLoading
                ? "Cargando usuarios..."
                : filteredUsers.length === 0
                  ? "Sin resultados"
                  : "Selecciona un usuario"
            }}
          </option>
          <option v-for="u in filteredUsers" :key="u.id" :value="String(u.id)">
            {{ u.firstName }} {{ u.lastName }}
          </option>
        </Field>
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
  firstName: string;
  lastName: string;
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
const client = useStrapiClient();

const users = ref<IAuthUser[]>([]);
const usersLoading = ref(false);
const userSearch = ref("");
const sending = ref(false);

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

const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase();
  if (!q) return users.value;
  return users.value.filter((u) =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(q),
  );
});

async function loadUsers() {
  usersLoading.value = true;
  try {
    const result = await client<{ data: IAuthUser[] }>("/users/authenticated");
    users.value = result.data ?? [];
  } catch (e) {
    console.error("[FormGift] loadUsers error:", e);
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
    await client(`/${props.endpoint}/gift`, {
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
      userSearch.value = "";
      loadUsers();
    }
  },
  { immediate: true },
);
</script>
