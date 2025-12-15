import { computed } from "vue";
import type { User, AdReservation, AdFeaturedReservation } from "@/types/user";

export const useUser = () => {
  const user = useStrapiUser<User>();

  const canRequestInvoice = computed(() => {
    if (!user.value?.is_company) return false;

    return !!(
      user.value.business_name &&
      user.value.business_type &&
      user.value.business_rut &&
      user.value.business_address &&
      user.value.business_address_number &&
      user.value.business_commune
    );
  });

  const getAdReservations = () => {
    const reservations = user.value?.ad_reservations || [];

    const usedReservations = reservations.filter(
      (reservation: AdReservation) => reservation.ad !== null,
    );

    const unusedReservations = reservations.filter(
      (reservation: AdReservation) => reservation.ad === null,
    );

    const unusedFreeReservations = unusedReservations.filter(
      (reservation: AdReservation) => Number(reservation.price) === 0,
    );

    const unusedPaidReservations = unusedReservations.filter(
      (reservation: AdReservation) => Number(reservation.price) > 0,
    );

    return {
      used: usedReservations,
      unused: unusedReservations,
      unusedFree: unusedFreeReservations,
      unusedPaid: unusedPaidReservations,
      total: reservations.length,
      usedCount: usedReservations.length,
      unusedCount: unusedReservations.length,
      unusedFreeCount: unusedFreeReservations.length,
      unusedPaidCount: unusedPaidReservations.length,
    };
  };

  const getAdReservationsText = () => {
    const reservations = getAdReservations();
    const { unusedFreeCount, unusedPaidCount } = reservations;

    // Casos con un solo anuncio
    if (unusedFreeCount === 1 && unusedPaidCount === 1) {
      return "Tienes <strong>1</strong> aviso de pago y <strong>1</strong> aviso gratuito.";
    } else if (unusedFreeCount === 1 && unusedPaidCount === 0) {
      return "Tienes <strong>1</strong> aviso gratuito.";
    } else if (unusedPaidCount === 1 && unusedFreeCount === 0) {
      return "Tienes <strong>1</strong> aviso de pago.";
    }
    // Casos con múltiples anuncios
    else if (unusedFreeCount > 0 && unusedPaidCount > 0) {
      return `Tienes <strong>${unusedPaidCount}</strong> avisos de pago y <strong>${unusedFreeCount}</strong> avisos gratuitos.`;
    } else if (unusedPaidCount > 0) {
      return `Tienes <strong>${unusedPaidCount}</strong> avisos de pago.`;
    } else if (unusedFreeCount > 0) {
      return `Tienes <strong>${unusedFreeCount}</strong> avisos gratuitos.`;
    } else {
      return "No tienes anuncios disponibles";
    }
  };

  const getAdFeaturedReservations = () => {
    const reservations = user.value?.ad_featured_reservations || [];

    const usedReservations = reservations.filter(
      (reservation: AdFeaturedReservation) => reservation.ad !== null,
    );

    const unusedReservations = reservations.filter(
      (reservation: AdFeaturedReservation) => reservation.ad === null,
    );

    return {
      used: usedReservations,
      unused: unusedReservations,
      total: reservations.length,
      usedCount: usedReservations.length,
      unusedCount: unusedReservations.length,
    };
  };

  const getUserAds = () => {
    return user.value?.ads || [];
  };

  const getUserOrders = () => {
    return user.value?.orders || [];
  };

  return {
    canRequestInvoice,
    getAdReservations,
    getAdReservationsText,
    getAdFeaturedReservations,
    getUserAds,
    getUserOrders,
  };
};
