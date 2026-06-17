<template>
  <section class="account account--profile">
    <!-- Header -->
    <span class="account--profile__eyebrow">Cuenta</span>
    <div class="account--profile__header">
      <div>
        <h1 class="account--profile__title">Mi perfil</h1>
        <p class="account--profile__intro">
          Tu identidad en Waldo.click. Esto es lo que ven los compradores cuando
          revisan tus anuncios.
        </p>
      </div>
      <nav class="account--profile__toggle" aria-label="Ver o editar perfil">
        <NuxtLink
          to="/cuenta/perfil"
          class="account--profile__toggle__btn"
          exact-active-class="account--profile__toggle__btn--active"
        >
          Ver
        </NuxtLink>
        <NuxtLink
          to="/cuenta/perfil/editar"
          class="account--profile__toggle__btn"
          exact-active-class="account--profile__toggle__btn--active"
        >
          Editar
        </NuxtLink>
      </nav>
    </div>

    <!-- Public profile preview card -->
    <div class="account--profile__preview">
      <div class="account--profile__preview__cover">
        <NuxtImg
          v-if="user.cover"
          :src="user.cover.url"
          alt="Portada"
          class="account--profile__preview__cover__img"
        />
      </div>
      <div class="account--profile__preview__body">
        <div class="account--profile__preview__avatar">
          <NuxtImg
            v-if="user.avatar"
            :src="user.avatar.url"
            :alt="`${user.firstname} ${user.lastname}`"
            class="account--profile__preview__avatar__img"
          />
          <span v-else class="account--profile__preview__avatar__initials">
            {{ avatarInitials }}
          </span>
        </div>

        <div class="account--profile__preview__info">
          <div class="account--profile__preview__name-row">
            <div class="account--profile__preview__name-group">
              <span class="account--profile__preview__name">
                {{ user.firstname }} {{ user.lastname }}
              </span>
              <span
                v-if="user.pro_status === 'active'"
                class="account--profile__preview__badge account--profile__preview__badge--pro"
              >
                <Sparkles :size="10" />
                PRO
              </span>
              <span
                v-if="user.confirmed"
                class="account--profile__preview__badge account--profile__preview__badge--verified"
              >
                <BadgeCheck :size="12" />
                Verificado
              </span>
            </div>
            <span class="account--profile__preview__tipo">
              <component :is="user.is_company ? Building2 : User" :size="14" />
              {{ user.is_company ? 'Empresa' : 'Persona Natural' }}
            </span>
          </div>

          <div class="account--profile__preview__meta">
            <span v-if="user.username" class="account--profile__preview__meta__item">
              <AtSign :size="14" />
              {{ user.username }}
            </span>
            <span
              v-if="user.commune?.name"
              class="account--profile__preview__meta__item"
            >
              <MapPin :size="14" />
              {{ user.commune.name }}
            </span>
            <span class="account--profile__preview__meta__item">
              <Calendar :size="14" />
              Miembro desde {{ memberYear }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Completeness bar -->
    <div class="account--profile__completeness">
      <div class="account--profile__completeness__row">
        <div>
          <span class="account--profile__completeness__label">
            Tu perfil está {{ completenessPercent }}% completo
          </span>
          <p class="account--profile__completeness__hint">
            Un perfil completo genera más confianza y más contactos.
          </p>
        </div>
        <span class="account--profile__completeness__pct">
          {{ completenessPercent }}%
        </span>
      </div>
      <div class="account--profile__completeness__track">
        <div
          class="account--profile__completeness__fill"
          :style="{ width: completenessPercent + '%' }"
        />
      </div>
    </div>

    <!-- Información personal -->
    <div class="account--profile__info-header">
      <h2 class="account--profile__section-title">Información personal</h2>
      <NuxtLink
        to="/cuenta/perfil/editar"
        class="account--profile__info-header__edit"
      >
        <Pencil :size="15" />
        Editar
      </NuxtLink>
    </div>
    <div class="account--profile__info">
      <div class="account--profile__info__grid">
        <div class="account--profile__info__row">
          <span class="account--profile__info__row__label">Nombres</span>
          <span class="account--profile__info__row__value">
            {{ user.firstname || '--' }}
          </span>
        </div>
        <div class="account--profile__info__row">
          <span class="account--profile__info__row__label">Apellidos</span>
          <span class="account--profile__info__row__value">
            {{ user.lastname || '--' }}
          </span>
        </div>
        <div class="account--profile__info__row">
          <span class="account--profile__info__row__label">RUT</span>
          <span class="account--profile__info__row__value">
            {{ user.rut || '--' }}
          </span>
        </div>
        <div class="account--profile__info__row">
          <span class="account--profile__info__row__label">
            Fecha de nacimiento
          </span>
          <span class="account--profile__info__row__value">
            {{ formattedBirthdate }}
          </span>
        </div>
        <div class="account--profile__info__row">
          <span class="account--profile__info__row__label">Teléfono</span>
          <span class="account--profile__info__row__value">
            {{ user.phone || '--' }}
          </span>
        </div>
        <div class="account--profile__info__row">
          <span class="account--profile__info__row__label">
            Correo electrónico
          </span>
          <span class="account--profile__info__row__value">
            {{ user.email || '--' }}
          </span>
        </div>
        <div class="account--profile__info__row">
          <span class="account--profile__info__row__label">Región</span>
          <span class="account--profile__info__row__value">
            {{ regionName }}
          </span>
        </div>
        <div class="account--profile__info__row">
          <span class="account--profile__info__row__label">Comuna</span>
          <span class="account--profile__info__row__value">
            {{ user.commune?.name || '--' }}
          </span>
        </div>
        <div class="account--profile__info__row">
          <span class="account--profile__info__row__label">Dirección</span>
          <span class="account--profile__info__row__value">
            {{ getAddress || '--' }}
          </span>
        </div>
        <div class="account--profile__info__row">
          <span class="account--profile__info__row__label">Código postal</span>
          <span class="account--profile__info__row__value">
            {{ user.postal_code || '--' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Empresa info -->
    <template v-if="user.is_company">
      <div class="account--profile__info-header">
        <h2 class="account--profile__section-title">
          Información de la empresa
        </h2>
        <NuxtLink
          to="/cuenta/perfil/editar"
          class="account--profile__info-header__edit"
        >
          <Pencil :size="15" />
          Editar
        </NuxtLink>
      </div>
      <div class="account--profile__info">
        <div class="account--profile__info__grid">
          <div class="account--profile__info__row">
            <span class="account--profile__info__row__label">Razón Social</span>
            <span class="account--profile__info__row__value">
              {{ user.business_name || '--' }}
            </span>
          </div>
          <div class="account--profile__info__row">
            <span class="account--profile__info__row__label">Giro</span>
            <span class="account--profile__info__row__value">
              {{ user.business_type || '--' }}
            </span>
          </div>
          <div class="account--profile__info__row">
            <span class="account--profile__info__row__label">RUT Empresa</span>
            <span class="account--profile__info__row__value">
              {{ user.business_rut || '--' }}
            </span>
          </div>
          <div class="account--profile__info__row">
            <span class="account--profile__info__row__label">
              Región empresa
            </span>
            <span class="account--profile__info__row__value">
              {{ businessRegionName }}
            </span>
          </div>
          <div class="account--profile__info__row">
            <span class="account--profile__info__row__label">
              Comuna empresa
            </span>
            <span class="account--profile__info__row__value">
              {{ user.business_commune?.name || '--' }}
            </span>
          </div>
          <div class="account--profile__info__row">
            <span class="account--profile__info__row__label">
              Dirección empresa
            </span>
            <span class="account--profile__info__row__value">
              {{ getBusinessAddress || '--' }}
            </span>
          </div>
          <div class="account--profile__info__row">
            <span class="account--profile__info__row__label">
              Código postal empresa
            </span>
            <span class="account--profile__info__row__value">
              {{ user.business_postal_code || '--' }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <!-- Identidad pública -->
    <div class="account--profile__identity-header">
      <h2 class="account--profile__section-title">Identidad pública</h2>
      <span
        v-if="user.pro_status === 'active'"
        class="account--profile__preview__badge account--profile__preview__badge--pro"
      >
        <Sparkles :size="10" />
        PRO
      </span>
    </div>
    <div class="account--profile__identity">
      <NuxtLink to="/cuenta/username" class="account--profile__identity__card">
        <span class="account--profile__identity__card__icon">
          <AtSign :size="20" />
        </span>
        <span class="account--profile__identity__card__label">
          Nombre de usuario
        </span>
        <span class="account--profile__identity__card__value">
          {{ user.username ? '@' + user.username : 'Sin usuario aún' }}
        </span>
        <span class="account--profile__identity__card__cta">
          Cambiar usuario
          <ArrowRight :size="14" />
        </span>
      </NuxtLink>

      <NuxtLink to="/cuenta/avatar" class="account--profile__identity__card">
        <span class="account--profile__identity__card__icon">
          <ImageIcon :size="20" />
        </span>
        <span class="account--profile__identity__card__label">
          Foto de perfil
        </span>
        <span class="account--profile__identity__card__value">
          {{ user.avatar ? 'Imagen actualizada' : 'Sin imagen aún' }}
        </span>
        <span class="account--profile__identity__card__cta">
          {{ user.avatar ? 'Cambiar foto' : 'Subir foto' }}
          <ArrowRight :size="14" />
        </span>
      </NuxtLink>

      <NuxtLink to="/cuenta/cover" class="account--profile__identity__card">
        <span class="account--profile__identity__card__icon">
          <PanelTop :size="20" />
        </span>
        <span class="account--profile__identity__card__label">Portada</span>
        <span class="account--profile__identity__card__value">
          {{ user.cover ? 'Portada subida' : 'Sin portada aún' }}
        </span>
        <span class="account--profile__identity__card__cta">
          {{ user.cover ? 'Cambiar portada' : 'Subir portada' }}
          <ArrowRight :size="14" />
        </span>
      </NuxtLink>
    </div>

    <!-- Plan PRO card -->
    <div v-if="user.pro_status === 'active'" class="account--profile__plan account--profile__plan--active">
      <div class="account--profile__plan__glow" />
      <div class="account--profile__plan__body">
        <span class="account--profile__plan__pill">
          <Sparkles :size="12" />
          WALDO PRO
        </span>
        <h3 class="account--profile__plan__title">
          Tu plan se renueva el 4 de cada mes
        </h3>
        <p class="account--profile__plan__text">
          Incluye 4 destacados gratis al mes, insignia PRO e identidad pública.
          $7.990/mes.
        </p>
      </div>
      <NuxtLink
        to="/cuenta/mis-ordenes"
        class="account--profile__plan__action"
      >
        Gestionar suscripción
      </NuxtLink>
    </div>

    <div
      v-else-if="user.pro_status === 'cancelled'"
      class="account--profile__plan account--profile__plan--inactive"
    >
      <div class="account--profile__plan__body">
        <span class="account--profile__plan__pill account--profile__plan__pill--free">
          PLAN GRATIS
        </span>
        <h3 class="account--profile__plan__title account--profile__plan__title--dark">
          Tu suscripción PRO está cancelada
        </h3>
        <p class="account--profile__plan__text account--profile__plan__text--dark">
          Recupera los destacados gratis, la insignia PRO y la identidad pública
          cuando quieras.
        </p>
      </div>
      <NuxtLink to="/cuenta/mis-ordenes" class="account--profile__plan__reactivate">
        <Sparkles :size="15" />
        Volver a PRO
      </NuxtLink>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import {
  Sparkles,
  BadgeCheck,
  MapPin,
  Calendar,
  AtSign,
  Pencil,
  ArrowRight,
  PanelTop,
  Building2,
  User,
  Image as ImageIcon,
} from "lucide-vue-next";

const user = useSessionUser();

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

const avatarInitials = computed(() => {
  const first = user.value.firstname?.[0] || "";
  const last = user.value.lastname?.[0] || "";
  return (first + last).toUpperCase() || "U";
});

const memberYear = computed(() => {
  if (!user.value.createdAt) return new Date().getFullYear();
  return new Date(user.value.createdAt).getFullYear();
});

const completenessPercent = computed(() => {
  const fields = [
    user.value.firstname,
    user.value.lastname,
    user.value.rut,
    user.value.phone,
    user.value.email,
    user.value.birthdate,
    user.value.address,
    user.value.address_number,
    user.value.commune,
    user.value.postal_code,
    user.value.avatar,
    user.value.username,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
});
</script>
