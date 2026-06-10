<template>
  <div>
    <HeroDefaultDashboard :title="title" :breadcrumbs="breadcrumbs" />
    <BoxContent>
      <template #content>
        <BoxInformation title="Información de usuario" :columns="2">
          <CardInfoDashboard
            v-if="item"
            title="Usuario"
            :description="item.username"
          />
          <CardInfoDashboard
            v-if="item"
            title="Correo electrónico"
            :description="item.email"
          />
          <CardInfoDashboard
            v-if="item"
            title="Nombre completo"
            :description="formatFullName(item.firstname, item.lastname)"
          />
          <CardInfoDashboard
            v-if="item"
            title="RUT"
            :description="formatRut(item.rut)"
          />
          <CardInfoDashboard
            v-if="item"
            title="Teléfono"
            :description="item.phone || '--'"
          />
          <CardInfoDashboard
            v-if="item"
            title="Fecha de nacimiento"
            :description="formatDateShort(item.birthdate)"
          />
          <CardInfoDashboard
            v-if="item"
            title="Dirección"
            :description="formatAddress(item.address, item.address_number)"
          />
          <CardInfoDashboard
            v-if="item"
            title="Región"
            :description="getRelationName(item.region)"
          />
          <CardInfoDashboard
            v-if="item"
            title="Comuna"
            :description="getRelationName(item.commune)"
          />
          <CardInfoDashboard
            v-if="item"
            title="Código postal"
            :description="item.postal_code || '--'"
          />
          <CardInfoDashboard
            v-if="item"
            title="Rol"
            :description="getRelationName(item.role)"
          />
          <CardInfoDashboard
            v-if="item"
            title="Pro"
            :description="item.pro_status ?? 'inactive'"
          />
          <CardInfoDashboard
            v-if="item"
            title="Confirmado"
            :description="formatBoolean(item.confirmed)"
          />
          <CardInfoDashboard
            v-if="item"
            title="Bloqueado"
            :description="formatBoolean(item.blocked)"
          />
        </BoxInformation>
        <BoxInformation title="Anuncios" :columns="1">
          <UserAnnouncements :user-id="String(route.params.id)" />
        </BoxInformation>
        <BoxInformation title="Reservas libres" :columns="1">
          <UserReservations
            :user-id="String(route.params.id)"
            :user-name="item?.username"
          />
        </BoxInformation>
        <BoxInformation title="Destacados libres" :columns="1">
          <UserFeatured :user-id="String(route.params.id)" />
        </BoxInformation>
        <BoxInformation
          v-if="item?.is_company"
          title="Información de empresa"
          :columns="2"
        >
          <CardInfoDashboard
            v-if="item"
            title="Razón social"
            :description="item.business_name || '--'"
          />
          <CardInfoDashboard
            v-if="item"
            title="Giro"
            :description="item.business_type || '--'"
          />
          <CardInfoDashboard
            v-if="item"
            title="RUT empresa"
            :description="item.business_rut ? formatRut(item.business_rut) : '--'"
          />
          <CardInfoDashboard
            v-if="item"
            title="Dirección empresa"
            :description="
              formatAddress(item.business_address, item.business_address_number)
            "
          />
          <CardInfoDashboard
            v-if="item"
            title="Región empresa"
            :description="getRelationName(item.business_region)"
          />
          <CardInfoDashboard
            v-if="item"
            title="Comuna empresa"
            :description="getRelationName(item.business_commune)"
          />
          <CardInfoDashboard
            v-if="item"
            title="Código postal empresa"
            :description="item.business_postal_code || '--'"
          />
        </BoxInformation>
      </template>
      <template #sidebar>
        <BoxInformation title="Detalles" :columns="1">
          <CardInfoDashboard
            v-if="item"
            title="Fecha de creación"
            :description="formatDate(item.createdAt)"
          />
          <CardInfoDashboard
            v-if="item"
            title="Última modificación"
            :description="formatDate(item.updatedAt)"
          />
        </BoxInformation>
      </template>
    </BoxContent>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { formatFullName, formatAddress, formatBoolean } from "@/utils/string";
import { useRut } from "@/composables/useRut";
import type { User, UserRelation } from "@/types/user";
import { formatDate, formatDateShort } from "@/utils/date";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const item = ref<User | null>(null);
const { formatRut } = useRut();
const apiClient = useApiClient();

const title = computed(() => item.value?.username || "Usuario");
const breadcrumbs = computed(() => [
  { label: "Usuarios", to: "/users" },
  ...(item.value?.username ? [{ label: item.value.username }] : []),
]);

const getRelationName = (relation?: UserRelation | null) => {
  if (!relation) return "--";
  if (typeof relation === "string") return relation;
  if (relation.name) return relation.name;
  if (relation.data?.attributes?.name) return relation.data.attributes.name;
  if (relation.data?.name) return relation.data.name;
  return "--";
};

const normalizeUser = (response: unknown): User | null => {
  if (!response) return null;
  if (typeof response === "object" && response !== null) {
    if ("data" in response) return (response as { data: User }).data;
    if ("id" in response) return response as User;
  }
  return null;
};

const { data: userData } = await useAsyncData(
  `user-${route.params.id}`,
  async () => {
    const id = route.params.id;
    if (!id) return null;
    try {
      const response = await apiClient(`users/${id}`, {
        method: "GET",
        params: {
          populate: {
            role: { fields: ["name"] },
            region: { fields: ["name"] },
            commune: { fields: ["name"] },
            business_region: { fields: ["name"] },
            business_commune: { fields: ["name"] },
          },
        } as unknown as Record<string, unknown>,
      });
      return normalizeUser(response);
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },
);

item.value = userData.value ?? null;
</script>
