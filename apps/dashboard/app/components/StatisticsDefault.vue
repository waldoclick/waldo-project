<template>
  <div class="statistics statistics--default">
    <div class="statistics--default__container">
      <div class="statistics--default__chart">
        <ChartSales />
      </div>
      <div class="statistics--default__cards">
        <CardStat
          title="Anuncios Pendientes"
          :value="counts.pending"
          :link="{ text: 'Ver pendientes', to: '/anuncios/pendientes' }"
          :icon="Clock"
          icon-color="#ca8a04"
          icon-bg-color="#fef9c3"
        />
        <CardStat
          title="Anuncios Publicados"
          :value="counts.published"
          :link="{ text: 'Ver publicados', to: '/anuncios/activos' }"
          :icon="CheckCircle"
          icon-color="#16a34a"
          icon-bg-color="#dcfce7"
        />
        <CardStat
          title="Anuncios Archivados"
          :value="counts.archived"
          :link="{ text: 'Ver archivados', to: '/anuncios/expirados' }"
          :icon="Archive"
          icon-color="#2563eb"
          icon-bg-color="#dbeafe"
        />
        <CardStat
          title="Anuncios Rechazados"
          :value="counts.rejected"
          :link="{ text: 'Ver rechazados', to: '/anuncios/rechazados' }"
          :icon="XCircle"
          icon-color="#dc2626"
          icon-bg-color="#fee2e2"
        />
        <CardStat
          title="Reservas Usadas"
          :value="counts.reservasUsadas"
          :link="{ text: 'Ver reservas usadas', to: '/reservas/usadas' }"
          :icon="CheckCircle"
          icon-color="#0d9488"
          icon-bg-color="#ccfbf1"
        />
        <CardStat
          title="Reservas Libres"
          :value="counts.reservasLibres"
          :link="{ text: 'Ver reservas libres', to: '/reservas/libres' }"
          :icon="Circle"
          icon-color="#0d9488"
          icon-bg-color="#ccfbf1"
        />
        <CardStat
          title="Destacados Usados"
          :value="counts.destacadosUsados"
          :link="{ text: 'Ver destacados usados', to: '/destacados/usados' }"
          :icon="CheckCircle"
          icon-color="#ca8a04"
          icon-bg-color="#fef9c3"
        />
        <CardStat
          title="Destacados Libres"
          :value="counts.destacadosLibres"
          :link="{ text: 'Ver destacados libres', to: '/destacados/libres' }"
          :icon="Circle"
          icon-color="#ca8a04"
          icon-bg-color="#fef9c3"
        />
        <CardStat
          title="Órdenes"
          :value="counts.ordenes"
          :link="{ text: 'Ver órdenes', to: '/ordenes' }"
          :icon="ShoppingCart"
          icon-color="#0d9488"
          icon-bg-color="#ccfbf1"
        />
        <CardStat
          title="Usuarios"
          :value="counts.usuarios"
          :link="{ text: 'Ver usuarios', to: '/usuarios' }"
          :icon="Users"
          icon-color="#7c3aed"
          icon-bg-color="#ede9fe"
        />
        <CardStat
          title="Categorías"
          :value="counts.categorias"
          :link="{ text: 'Ver categorías', to: '/categorias' }"
          :icon="Tag"
          icon-color="#db2777"
          icon-bg-color="#fce7f3"
        />
        <CardStat
          title="Condiciones"
          :value="counts.condiciones"
          :link="{ text: 'Ver condiciones', to: '/condiciones' }"
          :icon="FileCheck"
          icon-color="#ca8a04"
          icon-bg-color="#fef9c3"
        />
        <CardStat
          title="FAQ"
          :value="counts.faqs"
          :link="{ text: 'Ver FAQs', to: '/faqs' }"
          :icon="HelpCircle"
          icon-color="#7c3aed"
          icon-bg-color="#ede9fe"
        />
        <CardStat
          title="Packs"
          :value="counts.packs"
          :link="{ text: 'Ver packs', to: '/packs' }"
          :icon="Package"
          icon-color="#db2777"
          icon-bg-color="#fce7f3"
        />
        <CardStat
          title="Regiones"
          :value="counts.regiones"
          :link="{ text: 'Ver regiones', to: '/regiones' }"
          :icon="MapPin"
          icon-color="#059669"
          icon-bg-color="#d1fae5"
        />
        <CardStat
          title="Comunas"
          :value="counts.comunas"
          :link="{ text: 'Ver comunas', to: '/comunas' }"
          :icon="Building2"
          icon-color="#0d9488"
          icon-bg-color="#ccfbf1"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useStrapi } from "#imports";
import ChartSales from "@/components/ChartSales.vue";
import CardStat from "@/components/CardStat.vue";
import {
  Clock,
  CheckCircle,
  Archive,
  XCircle,
  Circle,
  ShoppingCart,
  Users,
  Tag,
  FileCheck,
  HelpCircle,
  Package,
  MapPin,
  Building2,
} from "lucide-vue-next";

const counts = ref({
  pending: 0,
  published: 0,
  archived: 0,
  rejected: 0,
  reservasUsadas: 0,
  reservasLibres: 0,
  destacadosUsados: 0,
  destacadosLibres: 0,
  ordenes: 0,
  usuarios: 0,
  categorias: 0,
  condiciones: 0,
  faqs: 0,
  packs: 0,
  regiones: 0,
  comunas: 0,
});

const countsLoading = ref(true);

onMounted(async () => {
  const strapi = useStrapi();
  try {
    countsLoading.value = true;
    const res = await strapi.find(
      "indicators/dashboard-stats" as any,
      {} as any,
    );
    const data = (res as any).data as typeof counts.value;
    if (data) {
      counts.value = {
        pending: data.pending ?? 0,
        published: data.published ?? 0,
        archived: data.archived ?? 0,
        rejected: data.rejected ?? 0,
        reservasUsadas: data.reservasUsadas ?? 0,
        reservasLibres: data.reservasLibres ?? 0,
        destacadosUsados: data.destacadosUsados ?? 0,
        destacadosLibres: data.destacadosLibres ?? 0,
        ordenes: data.ordenes ?? 0,
        usuarios: data.usuarios ?? 0,
        categorias: data.categorias ?? 0,
        condiciones: data.condiciones ?? 0,
        faqs: data.faqs ?? 0,
        packs: data.packs ?? 0,
        regiones: data.regiones ?? 0,
        comunas: data.comunas ?? 0,
      };
    }
  } catch (error) {
    console.error("Error fetching statistics counts:", error);
  } finally {
    countsLoading.value = false;
  }
});
</script>
