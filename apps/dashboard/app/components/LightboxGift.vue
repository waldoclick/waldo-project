<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { X as IconX } from "lucide-vue-next";

interface IAuthUser {
  id: number;
  firstName: string;
  lastName: string;
}

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    endpoint: string;
    label: string;
  }>(),
  {},
);

const emit = defineEmits<{ (event: "close" | "gifted"): void }>();

const client = useStrapiClient();
const { Swal } = useSweetAlert2();

const users = ref<IAuthUser[]>([]);
const usersLoading = ref(false);
const selectedUserId = ref<number | null>(null);
const userSearch = ref("");
const quantity = ref(1);
const loading = ref(false);

const filteredUsers = computed(() => {
  const search = userSearch.value.toLowerCase();
  if (!search) return users.value;
  return users.value.filter((u) =>
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search),
  );
});

async function loadUsers(): Promise<void> {
  usersLoading.value = true;
  try {
    const result = await client<{ data: IAuthUser[] }>("/users/authenticated");
    users.value = result.data;
  } catch (error) {
    console.error("Error loading authenticated users:", error);
  } finally {
    usersLoading.value = false;
  }
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      quantity.value = 1;
      selectedUserId.value = null;
      userSearch.value = "";
      loadUsers();
    } else {
      document.body.style.overflow = "";
    }
  },
);

async function handleSubmit(): Promise<void> {
  if (!selectedUserId.value || quantity.value < 1 || loading.value) return;

  const { isConfirmed } = await Swal.fire({
    title: "¿Confirmar regalo?",
    text: `Vas a regalar ${quantity.value} ${props.label} al usuario seleccionado.`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, regalar",
    cancelButtonText: "Cancelar",
  });

  if (!isConfirmed) return;

  loading.value = true;
  try {
    await client(`/${props.endpoint}/gift`, {
      method: "POST",
      body: { userId: selectedUserId.value, quantity: quantity.value },
    });
    emit("gifted");
    handleClose();
  } catch {
    await Swal.fire("Error", "No se pudo enviar el regalo.", "error");
  } finally {
    loading.value = false;
  }
}

function handleClose(): void {
  document.body.style.overflow = "";
  emit("close");
}
</script>

<template>
  <div :class="{ 'is-open': isOpen }" class="lightbox lightbox--gift">
    <div class="lightbox--gift__backdrop" @click="handleClose" />
    <div class="lightbox--gift__box" role="dialog" aria-modal="true">
      <button
        title="Cerrar"
        type="button"
        class="lightbox__button"
        @click="handleClose"
      >
        <IconX :size="24" />
      </button>
      <div class="lightbox--gift__header">
        <div class="lightbox--gift__header__title">Regalar reservas</div>
        <div class="lightbox--gift__header__subtitle">
          Selecciona un usuario y la cantidad a regalar
        </div>
      </div>
      <!-- Quantity field -->
      <div class="lightbox--gift__field">
        <label for="lightbox-gift-quantity">Cantidad</label>
        <input
          id="lightbox-gift-quantity"
          v-model.number="quantity"
          type="number"
          min="1"
        />
      </div>
      <!-- User search + select -->
      <div class="lightbox--gift__field">
        <label for="lightbox-gift-search">Usuario</label>
        <input
          id="lightbox-gift-search"
          v-model="userSearch"
          type="text"
          placeholder="Buscar por nombre..."
        />
        <select
          v-model="selectedUserId"
          size="6"
          class="lightbox--gift__field__select"
        >
          <option v-if="usersLoading" disabled value="">
            Cargando usuarios...
          </option>
          <option v-else-if="filteredUsers.length === 0" disabled value="">
            Sin resultados
          </option>
          <option v-for="u in filteredUsers" :key="u.id" :value="u.id">
            {{ u.firstName }} {{ u.lastName }}
          </option>
        </select>
      </div>
      <!-- Actions -->
      <div class="lightbox--gift__actions">
        <button class="btn btn--secondary" type="button" @click="handleClose">
          Cancelar
        </button>
        <button
          class="btn btn--primary"
          type="button"
          :disabled="loading || !selectedUserId || quantity < 1"
          @click="handleSubmit"
        >
          {{ loading ? "Enviando..." : "Regalar" }}
        </button>
      </div>
    </div>
  </div>
</template>
