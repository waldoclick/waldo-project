<template>
  <section class="account account--profile">
    <div class="account--profile__title title">Datos personales</div>
    <!-- <pre>{{ user }}</pre> -->

    <div class="account--profile__box">
      <div class="account--profile__heading">
        Información personal
        <NuxtLink to="/cuenta/perfil/editar" title="Editar">
          <IconEdit size="16" class="icon-edit" />
          Editar
        </NuxtLink>
      </div>
      <div class="account--profile__grid">
        <CardInfo :title="`Nombres`" :description="user.firstname || '--'" />
        <CardInfo :title="`Apellidos`" :description="user.lastname || '--'" />
        <CardInfo :title="`Rut`" :description="user.rut" />
        <CardInfo :title="`Región`" :description="regionName" />
        <CardInfo :title="`Comuna`" :description="user.commune?.name || '--'" />
        <CardInfo :title="`Dirección`" :description="getAddress" />
        <CardInfo :title="`Teléfono`" :description="user.phone" />
        <CardInfo :title="`Correo electrónico`" :description="user.email" />
        <CardInfo :title="`Código Postal`" :description="user.postal_code" />
        <CardInfo
          :title="`Fecha de Nacimiento`"
          :description="formattedBirthdate"
        />
      </div>
    </div>

    <div v-if="user.is_company" class="account--profile__box">
      <div class="account--profile__heading">
        Información de la Empresa
        <NuxtLink to="/cuenta/perfil/editar" title="Editar">
          <IconEdit size="16" class="icon-edit" />
          Editar
        </NuxtLink>
      </div>
      <div class="account--profile__grid">
        <CardInfo :title="`Razón Social`" :description="user.business_name" />
        <CardInfo :title="`Giro`" :description="user.business_type" />
        <CardInfo :title="`RUT Empresa`" :description="user.business_rut" />
        <CardInfo :title="`Región`" :description="businessRegionName" />
        <CardInfo
          :title="`Comuna`"
          :description="user.business_commune?.name || ''"
        />
        <CardInfo
          :title="`Dirección Empresa`"
          :description="getBusinessAddress"
        />
        <CardInfo
          :title="`Código Postal Empresa`"
          :description="user.business_postal_code"
        />
      </div>
    </div>

    <div class="account--profile__box">
      <div class="account--profile__heading">Como te ven los compradores</div>
      <div class="account--profile__grid">
        <CardInfo
          :title="`Tipo de perfil`"
          :description="user.pro ? 'Público' : 'Privado'"
        />
        <CardInfo
          :title="`Tipo de usuario`"
          :description="user.is_company ? 'Empresa' : 'Persona Natural'"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import CardInfo from "@/components/CardInfo.vue";
import { Edit as IconEdit } from "lucide-vue-next";

const user = useStrapiUser();

const getAddress = computed(() => {
  if (!user.value.address) return "";
  return `${user.value.address}${
    user.value.address_number ? `, ${user.value.address_number}` : ""
  }`.trim();
});

const getBusinessAddress = computed(() => {
  if (!user.value.business_address) return "";
  return `${user.value.business_address}${
    user.value.business_address_number
      ? `, ${user.value.business_address_number}`
      : ""
  }`.trim();
});

const formattedBirthdate = computed(() => {
  if (!user.value.birthdate) return "--";
  const date = new Date(user.value.birthdate);
  if (Number.isNaN(date.getTime())) return "--";

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
});

const regionName = computed(() => {
  return user.value.region?.name || user.value.commune?.region?.name || "--";
});

const businessRegionName = computed(() => {
  return (
    user.value.business_region?.name ||
    user.value.business_commune?.region?.name ||
    "--"
  );
});
</script>
