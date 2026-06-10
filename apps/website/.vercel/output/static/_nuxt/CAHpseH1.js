import { cF as b, b9 as n } from "./BK8sApmn.js";
import { u as y } from "./CsS7OJ1I.js";
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
    u = new t.Error().stack;
  u &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[u] = "a8b71e34-7dc3-4658-8781-7cef3c0d3591"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-a8b71e34-7dc3-4658-8781-7cef3c0d3591"));
} catch {}
const k = () => {
  const t = b(),
    { packs: u } = y(),
    c = 1e4,
    d = (e) =>
      new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      }).format(e),
    a = n(() =>
      typeof t.pack != "number"
        ? null
        : u.value.find((e) => e.id === t.pack) || null,
    ),
    r = n(() => {
      const e = t.pack;
      if (e === "free") return { label: "1 anuncio gratuito", amount: 0 };
      if (e === "paid") return { label: "1 anuncio ya pagado", amount: 0 };
      if (a.value) {
        const l =
          (typeof a.value.total_ads == "string"
            ? Number.parseInt(a.value.total_ads, 10)
            : a.value.total_ads) === 1
            ? "anuncio"
            : "anuncios";
        return {
          label: `${a.value.total_ads} ${l} x ${d(a.value.price)}`,
          amount: a.value.price,
        };
      }
      return null;
    }),
    o = n(() => {
      const e = t.featured;
      return e === "free"
        ? { label: " + destacado gratis", amount: 0 }
        : e === !0
          ? { label: ` + destacado x ${d(c)}`, amount: c }
          : { label: "", amount: 0 };
    }),
    i = n(() => {
      if (!r.value) return 0;
      const e = r.value.amount ?? 0,
        s = o.value?.amount ?? 0,
        l = typeof e == "string" ? Number.parseInt(e, 10) : e,
        p = typeof s == "string" ? Number.parseInt(s, 10) : s;
      return (l || 0) + (p || 0);
    }),
    f = n(() => i.value > 0),
    m = n(() => {
      if (!r.value) return "";
      let e = r.value.label;
      return (o.value?.label && (e += o.value.label), e);
    });
  return {
    packPart: r,
    featuredPart: o,
    totalAmount: i,
    hasToPay: f,
    paymentSummaryText: m,
  };
};
export { k as u };
//# sourceMappingURL=CAHpseH1.js.map
