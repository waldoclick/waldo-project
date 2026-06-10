import { cF as _ } from "./BK8sApmn.js";
try {
  let t =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    n = new t.Error().stack;
  n &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[n] = "fef4514b-6902-4d6f-a08d-26b35a2bd116"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-fef4514b-6902-4d6f-a08d-26b35a2bd116"));
} catch {}
const P = () => {
  const t = _(),
    n = (e, c, a = {}, i = "ad_creation") => {
      if (typeof window > "u") return;
      ((window.dataLayer = window.dataLayer || []),
        window.dataLayer.push({ ecommerce: null }));
      const s = { event: e, flow: i, ...a };
      (c.length > 0 && (s.ecommerce = { items: c }), window.dataLayer.push(s));
    },
    d = (e) => {
      (t.updateViewItemList(e), n("view_item_list", e));
    },
    l = (e) => {
      (t.getAnalytics.pack_selected && o(t.getAnalytics.pack_selected),
        t.updatePackSelected(e),
        n("add_to_cart", [e]));
    },
    u = (e) => {
      (t.getAnalytics.featured_selected && o(t.getAnalytics.featured_selected),
        t.updateFeaturedSelected(e),
        n("add_to_cart", [e]));
    },
    o = (e) => {
      n("remove_from_cart", [e]);
    };
  return {
    viewItemList: d,
    addToCartPack: l,
    addToCartFeatured: u,
    removeFromCart: o,
    beginCheckout: () => {
      const e = [];
      (t.getAnalytics.pack_selected && e.push(t.getAnalytics.pack_selected),
        t.getAnalytics.featured_selected &&
          e.push(t.getAnalytics.featured_selected),
        e.length > 0 && n("begin_checkout", e));
    },
    addPaymentInfo: () => {
      const e = [];
      (t.getAnalytics.pack_selected && e.push(t.getAnalytics.pack_selected),
        t.getAnalytics.featured_selected &&
          e.push(t.getAnalytics.featured_selected),
        e.length > 0 && n("add_payment_info", e));
    },
    sendErrorEvent: (e, c) => {
      n("exception", [], { description: `${e}: ${c}`, fatal: !1 });
    },
    stepView: (e, c) => {
      n("step_view", [], { step_number: e, step_name: c });
    },
    pushEvent: n,
    purchase: (e) => {
      const c = String(e.id ?? ""),
        a = Number(e.amount ?? e.totalAmount ?? 0),
        i = e.currency ?? "CLP",
        s =
          e.items && e.items.length > 0
            ? e.items.map((r) => ({
                item_id: r.name.toLowerCase().replace(/\s+/g, "_"),
                item_name: r.name,
                item_category: "Order",
                price: Number(r.price),
                quantity: r.quantity,
                currency: i,
              }))
            : [
                {
                  item_id: e.documentId || "",
                  item_name: "Orden de pago",
                  item_category: "Order",
                  price: a,
                  quantity: 1,
                  currency: i,
                },
              ];
      n(
        "purchase",
        [],
        { ecommerce: { transaction_id: c, value: a, currency: i, items: s } },
        "pack_purchase",
      );
    },
    viewItemListPublic: (e) => {
      if (e.length === 0) return;
      const c = e.map((a) => ({
        item_id: String(a.id),
        item_name: a.name,
        item_category:
          typeof a.category == "object" && a.category !== null
            ? a.category.name
            : "Unknown",
        price: a.price ?? 0,
        quantity: 1,
        currency: a.currency ?? "CLP",
      }));
      n("view_item_list", c, {}, "ad_discovery");
    },
    viewItem: (e) => {
      const c =
        typeof e.category == "object" && e.category !== null
          ? e.category.name
          : "Unknown";
      n(
        "view_item",
        [
          {
            item_id: String(e.id),
            item_name: e.name,
            item_category: c,
            price: e.price ?? 0,
            quantity: 1,
            currency: e.currency ?? "CLP",
          },
        ],
        {},
        "ad_discovery",
      );
    },
    search: (e) => {
      n("search", [], { search_term: e }, "ad_discovery");
    },
    contactSeller: (e) => {
      n("contact", [], { method: e }, "user_engagement");
    },
    generateLead: () => {
      n("generate_lead", [], {}, "user_engagement");
    },
    signUp: () => {
      n("sign_up", [], { method: "email" }, "user_lifecycle");
    },
    login: (e) => {
      n("login", [], { method: e }, "user_lifecycle");
    },
    articleView: (e, c, a) => {
      n(
        "article_view",
        [],
        { article_id: e, article_title: c, article_category: a },
        "content_engagement",
      );
    },
  };
};
export { P as u };
//# sourceMappingURL=CJzzMwWR.js.map
