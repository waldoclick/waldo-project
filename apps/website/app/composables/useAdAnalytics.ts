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

export interface PurchaseOrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface PurchaseOrderData {
  id?: number | string;
  documentId?: string;
  amount?: number;
  totalAmount?: number;
  currency?: string;
  items?: PurchaseOrderItem[];
  payment_response?: {
    buy_order?: string;
    authorization_code?: string;
  };
}

export interface DataLayerEvent {
  event: string;
  flow: string;
  ecommerce?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export const useAdAnalytics = () => {
  const adStore = useAdStore();

  const pushEvent = (
    eventName: string,
    items: AnalyticsItem[],
    extraData: Record<string, unknown> = {},
    flow = "ad_creation",
  ) => {
    if (typeof window === "undefined") return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });

    const eventData: DataLayerEvent = {
      event: eventName,
      flow,
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

  const purchase = (order: PurchaseOrderData) => {
    // Use the Order's numeric id as transaction_id — stable, gateway-agnostic identifier.
    // buy_order is Webpay-specific; documentId is a CMS identifier, not a business identifier.
    const transactionId = String(order.id ?? "");
    // Number() coercion required: Strapi biginteger fields serialize to strings in JSON responses
    const value = Number(order.amount ?? order.totalAmount ?? 0);
    const currency = order.currency ?? "CLP";

    // Map order line items when available (e.g. "1 Aviso", "Anuncio destacado").
    // Fall back to a single generic item for free-ad orders that have no line items.
    const items: AnalyticsItem[] =
      order.items && order.items.length > 0
        ? order.items.map((item) => ({
            item_id: item.name.toLowerCase().replace(/\s+/g, "_"),
            item_name: item.name,
            item_category: "Order",
            price: Number(item.price),
            quantity: item.quantity,
            currency,
          }))
        : [
            {
              item_id: order.documentId || "",
              item_name: "Orden de pago",
              item_category: "Order",
              price: value,
              quantity: 1,
              currency,
            },
          ];

    pushEvent(
      "purchase",
      [],
      {
        ecommerce: {
          transaction_id: transactionId,
          value,
          currency,
          items,
        },
      },
      "pack_purchase",
    );
  };

  const viewItemListPublic = (
    ads: Array<{
      id: number | string;
      name: string;
      price?: number;
      currency?: string;
      category?: number | { name: string } | null;
    }>,
  ) => {
    if (ads.length === 0) return;
    const items: AnalyticsItem[] = ads.map((ad) => ({
      item_id: String(ad.id),
      item_name: ad.name,
      item_category:
        typeof ad.category === "object" && ad.category !== null
          ? (ad.category as { name: string }).name
          : "Unknown",
      price: ad.price ?? 0,
      quantity: 1,
      currency: ad.currency ?? "CLP",
    }));
    pushEvent("view_item_list", items, {}, "ad_discovery");
  };

  const viewItem = (ad: {
    id: number | string;
    name: string;
    price?: number;
    currency?: string;
    category?: number | { name: string } | null;
  }) => {
    const category =
      typeof ad.category === "object" && ad.category !== null
        ? (ad.category as { name: string }).name
        : "Unknown";
    pushEvent(
      "view_item",
      [
        {
          item_id: String(ad.id),
          item_name: ad.name,
          item_category: category,
          price: ad.price ?? 0,
          quantity: 1,
          currency: ad.currency ?? "CLP",
        },
      ],
      {},
      "ad_discovery",
    );
  };

  const search = (searchTerm: string) => {
    pushEvent("search", [], { search_term: searchTerm }, "ad_discovery");
  };

  const contactSeller = (method: "email" | "phone") => {
    pushEvent("contact", [], { method }, "user_engagement");
  };

  const generateLead = () => {
    pushEvent("generate_lead", [], {}, "user_engagement");
  };

  const signUp = () => {
    pushEvent("sign_up", [], { method: "email" }, "user_lifecycle");
  };

  const login = (method: "email" | "google") => {
    pushEvent("login", [], { method }, "user_lifecycle");
  };

  const articleView = (
    id: string | number,
    title: string,
    category: string,
  ) => {
    pushEvent(
      "article_view",
      [],
      { article_id: id, article_title: title, article_category: category },
      "content_engagement",
    );
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
    purchase,
    viewItemListPublic,
    viewItem,
    search,
    contactSeller,
    generateLead,
    signUp,
    login,
    articleView,
  };
};
