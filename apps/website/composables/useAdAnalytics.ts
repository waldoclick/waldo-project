/**
 * Composable para el seguimiento analítico del flujo de creación de anuncios
 */

import { useAdStore } from "@/stores/ad.store";

interface AnalyticsItem {
  item_id?: string | number;
  item_name: string;
  item_category: string;
  price?: number;
  quantity?: number;
  currency?: string;
}

// Crear objetos de análisis a partir de los datos del store
const createPackAnalyticsItem = (packId: number | string) => {
  return {
    item_id: packId.toString(),
    item_name: `Pack ${packId}`,
    item_category: "Pack",
    price: 0,
    currency: "CLP",
  } as AnalyticsItem;
};

const createFeaturedAnalyticsItem = (featuredValue: boolean) => {
  return {
    item_id: featuredValue ? "featured" : "not_featured",
    item_name: featuredValue ? "Destacado" : "Sin destacar",
    item_category: "Destacado",
    price: 0,
    currency: "CLP",
  } as AnalyticsItem;
};

export const useAdAnalytics = () => {
  const adStore = useAdStore();

  const pushEvent = (
    eventName: string,
    items: AnalyticsItem[],
    extraData = {},
  ) => {
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });

    const eventData: any = {
      event: eventName,
      flow: "ad_creation",
      ...extraData,
    };

    if (items.length > 0) {
      eventData.ecommerce = {
        items,
      };
    }

    window.dataLayer.push(eventData);
  };

  const viewItemList = (items: AnalyticsItem[]) => {
    // Actualizar el store con los items
    adStore.updateViewItemList(items);
    // Enviar el evento
    pushEvent("view_item_list", items);
  };

  const addToCartPack = (item: AnalyticsItem) => {
    // Si hay un pack seleccionado, lo eliminamos
    if (adStore.getAnalytics.pack_selected) {
      removeFromCart(adStore.getAnalytics.pack_selected);
    }

    // Guardamos el nuevo pack y enviamos el evento
    adStore.updatePackSelected(item);
    pushEvent("add_to_cart", [item]);
  };

  const addToCartFeatured = (item: AnalyticsItem) => {
    // Si hay un featured seleccionado, lo eliminamos
    if (adStore.getAnalytics.featured_selected) {
      removeFromCart(adStore.getAnalytics.featured_selected);
    }

    // Guardamos el nuevo featured y enviamos el evento
    adStore.updateFeaturedSelected(item);
    pushEvent("add_to_cart", [item]);
  };

  const removeFromCart = (item: AnalyticsItem) => {
    pushEvent("remove_from_cart", [item]);
  };

  const beginCheckout = () => {
    const items: AnalyticsItem[] = [];
    if (adStore.getAnalytics.pack_selected) {
      items.push(adStore.getAnalytics.pack_selected);
    }
    if (adStore.getAnalytics.featured_selected) {
      items.push(adStore.getAnalytics.featured_selected);
    }
    if (items.length > 0) {
      pushEvent("begin_checkout", items);
    }
  };

  const addPaymentInfo = () => {
    const items: AnalyticsItem[] = [];
    if (adStore.getAnalytics.pack_selected) {
      items.push(adStore.getAnalytics.pack_selected);
    }
    if (adStore.getAnalytics.featured_selected) {
      items.push(adStore.getAnalytics.featured_selected);
    }
    if (items.length > 0) {
      pushEvent("add_payment_info", items);
    }
  };

  const sendErrorEvent = (errorType: string, errorMessage: string) => {
    pushEvent("exception", [], {
      description: `${errorType}: ${errorMessage}`,
      fatal: false,
    });
  };

  const stepView = (stepNumber: number, stepName: string) => {
    pushEvent("step_view", [], {
      step_number: stepNumber,
      step_name: stepName,
    });
  };

  return {
    viewItemList,
    addToCartPack,
    addToCartFeatured,
    removeFromCart,
    beginCheckout,
    addPaymentInfo,
    sendErrorEvent,
    stepView,
    pushEvent,
  };
};
