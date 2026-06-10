import {
  aZ as w,
  a_ as o,
  a$ as u,
  b6 as p,
  b5 as D,
  bS as F,
  bC as q,
  b1 as m,
  bf as r,
  bi as y,
  b7 as c,
  b0 as h,
  br as A,
  b9 as d,
  bJ as T,
  b3 as k,
  b8 as g,
} from "./BK8sApmn.js";
import { A as x } from "./SVS4z4K_.js";
try {
  let e =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    t = new e.Error().stack;
  t &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[t] = "161ced7e-2a6c-4213-be82-700b042d84f5"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-161ced7e-2a6c-4213-be82-700b042d84f5"));
} catch {}
const C = { id: "preguntas-frecuentes", class: "faq faq--default" },
  E = { key: 0, class: "faq--default__container" },
  I = { class: "faq--default__accordion" },
  S = { class: "faq--default__accordion__wrapper" },
  B = { key: 2, class: "faq--default__button" },
  V = w({
    __name: "FaqDefault",
    props: {
      title: {},
      text: {},
      limit: {},
      faqs: {},
      isLeft: { type: Boolean },
      titleTag: {},
    },
    setup(e) {
      const t = e,
        s = t.title ?? "Preguntas Frecuentes",
        n = t.limit ?? null,
        f = t.titleTag ?? "h2",
        _ = d(() => "h3"),
        a = d(() =>
          n && t.faqs && t.faqs.length > 0 ? t.faqs.slice(0, n) : t.faqs,
        ),
        l = d(() => n && t.faqs && t.faqs.length >= n);
      return (b, i) => {
        const v = A;
        return (
          o(),
          u("section", C, [
            a.value && a.value.length > 0
              ? (o(),
                u("div", E, [
                  p(s)
                    ? (o(),
                      D(
                        F(p(f)),
                        {
                          key: 0,
                          class: q([
                            "faq--default__title title",
                            { "faq--default__title--left": e.isLeft },
                          ]),
                        },
                        {
                          default: m(() => [r("span", null, y(p(s)), 1)]),
                          _: 1,
                        },
                        8,
                        ["class"],
                      ))
                    : c("", !0),
                  e.text
                    ? (o(),
                      u(
                        "div",
                        {
                          key: 1,
                          class: q([
                            "faq--default__paragraph paragraph",
                            { "faq--default__paragraph--left": e.isLeft },
                          ]),
                        },
                        [r("span", null, y(e.text), 1)],
                        2,
                      ))
                    : c("", !0),
                  r("div", I, [
                    r("div", S, [
                      h(
                        x,
                        { questions: a.value, "title-tag": _.value },
                        null,
                        8,
                        ["questions", "title-tag"],
                      ),
                    ]),
                  ]),
                  l.value
                    ? (o(),
                      u("div", B, [
                        h(
                          v,
                          {
                            to: "/preguntas-frecuentes",
                            class: "btn btn--primary btn--announcement",
                            title: "Ver todas las preguntas",
                          },
                          {
                            default: m(() => [
                              ...(i[0] ||
                                (i[0] = [
                                  r(
                                    "span",
                                    null,
                                    "Ver todas las preguntas",
                                    -1,
                                  ),
                                ])),
                            ]),
                            _: 1,
                          },
                        ),
                      ]))
                    : c("", !0),
                ]))
              : c("", !0),
          ])
        );
      };
    },
  }),
  G = Object.assign(V, { __name: "FaqDefault" }),
  L = 20,
  P = T("faqs", () => {
    const e = g([]),
      t = g(!1),
      s = g(null),
      n = k(),
      f = async () => {
        try {
          ((t.value = !0), (s.value = null));
          const l = await n("faqs", {
            method: "GET",
            params: {
              pagination: { pageSize: L, page: 1 },
              populate: "*",
              sort: ["createdAt:asc"],
            },
          });
          if (!l.data || !Array.isArray(l.data))
            throw new Error("Formato de datos inválido");
          e.value = l.data.sort(
            (b, i) =>
              new Date(b.createdAt).getTime() - new Date(i.createdAt).getTime(),
          );
        } catch {
          s.value = "Error al cargar las FAQs";
        } finally {
          t.value = !1;
        }
      },
      _ = d(() => e.value.filter((a) => a.featured === !0));
    return { faqs: e, featuredFaqs: _, loading: t, error: s, loadFaqs: f };
  });
export { G as F, P as u };
//# sourceMappingURL=DWOKIegE.js.map
