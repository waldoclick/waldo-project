import {
  aZ as Q,
  bb as S,
  b2 as T,
  b3 as $,
  bc as E,
  bp as N,
  bd as F,
  be as U,
  a_ as z,
  b5 as j,
  b1 as M,
  bf as o,
  b0 as u,
  b6 as l,
  bg as _,
  bh as I,
  bi as O,
  bj as P,
  b8 as v,
  b9 as w,
  bk as R,
} from "./BK8sApmn.js";
try {
  let s =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    c = new s.Error().stack;
  c &&
    ((s._sentryDebugIds = s._sentryDebugIds || {}),
    (s._sentryDebugIds[c] = "13be73a6-af84-43a4-a845-1e5169a0923e"),
    (s._sentryDebugIdIdentifier =
      "sentry-dbid-13be73a6-af84-43a4-a845-1e5169a0923e"));
} catch {}
const H = { class: "form form--faq" },
  L = { class: "form__group" },
  Z = { class: "form__group" },
  G = { class: "form__group form__group--checkboxes" },
  J = { class: "form__check" },
  K = { class: "form__send" },
  W = ["disabled"],
  X = Q({
    __name: "FormFaq",
    props: { faq: {} },
    emits: ["saved"],
    setup(s, { emit: c }) {
      const a = s,
        q = c,
        { Swal: f } = R(),
        m = S(),
        V = T(),
        y = $(),
        n = v(!1),
        x = v(null),
        k = E({
          title: F().required("Título es requerido"),
          text: F().required("Contenido es requerido"),
          featured: N().default(!1),
        }),
        r = v({ title: "", text: "", featured: !1 }),
        h = w(() => !!(a.faq?.documentId || a.faq?.id)),
        A = w(() => (h.value ? "Actualizar FAQ" : "Crear FAQ")),
        D = () => {
          ((r.value = {
            title: a.faq?.title || "",
            text: a.faq?.text || "",
            featured: !!a.faq?.featured,
          }),
            (x.value = a.faq?.id || a.faq?.documentId || null));
        },
        C = async (d) => {
          n.value = !0;
          try {
            const e = {
              title: d.title.trim(),
              text: d.text.trim(),
              featured: !!d.featured,
            };
            if (h.value) {
              const i = V.params.id,
                t = a.faq?.documentId || (typeof i == "string" ? i : void 0);
              if (!t) {
                (await f.fire(
                  "Error",
                  "No se pudo identificar el FAQ para actualizar.",
                  "error",
                ),
                  (n.value = !1));
                return;
              }
              const p = (
                  await y(`/faqs/${t}`, { method: "PUT", body: { data: e } })
                ).data,
                B = { ...a.faq, ...p, ...e };
              ((r.value = {
                title: e.title,
                text: e.text,
                featured: e.featured,
              }),
                q("saved", B),
                await f.fire(
                  "Éxito",
                  "FAQ actualizado correctamente.",
                  "success",
                ));
              const g = p?.documentId || p?.id;
              g && m.push(`/dashboard/maintenance/faqs/${g}`);
            } else {
              const t = (
                await y("/faqs", { method: "POST", body: { data: e } })
              ).data;
              (q("saved", t || {}),
                await f.fire("Éxito", "FAQ creado correctamente.", "success"));
              const b = t?.documentId || t?.id;
              b
                ? m.push(`/dashboard/maintenance/faqs/${b}`)
                : m.push("/dashboard/maintenance/faqs");
            }
          } catch {
            await f.fire("Error", "No se pudo guardar el FAQ.", "error");
          } finally {
            n.value = !1;
          }
        };
      return (
        U(
          () => a.faq,
          (d) => {
            if (!d || n.value) return;
            const e = d.id || d.documentId || null;
            (e && e === x.value) || D();
          },
          { immediate: !0 },
        ),
        (d, e) => (
          z(),
          j(
            l(P),
            { "validation-schema": l(k), onSubmit: C },
            {
              default: M(({ meta: i }) => [
                o("div", H, [
                  o("div", L, [
                    e[3] ||
                      (e[3] = o(
                        "label",
                        { class: "form__label", for: "title" },
                        "Título",
                        -1,
                      )),
                    u(
                      l(_),
                      {
                        modelValue: r.value.title,
                        "onUpdate:modelValue":
                          e[0] || (e[0] = (t) => (r.value.title = t)),
                        name: "title",
                        type: "text",
                        class: "form__control",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    u(l(I), { name: "title" }),
                  ]),
                  o("div", Z, [
                    e[4] ||
                      (e[4] = o(
                        "label",
                        { class: "form__label", for: "text" },
                        "Contenido",
                        -1,
                      )),
                    u(
                      l(_),
                      {
                        modelValue: r.value.text,
                        "onUpdate:modelValue":
                          e[1] || (e[1] = (t) => (r.value.text = t)),
                        as: "textarea",
                        name: "text",
                        class: "form__control",
                        rows: "5",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    u(l(I), { name: "text" }),
                  ]),
                  o("div", G, [
                    o("div", J, [
                      u(
                        l(_),
                        {
                          id: "featured",
                          modelValue: r.value.featured,
                          "onUpdate:modelValue":
                            e[2] || (e[2] = (t) => (r.value.featured = t)),
                          name: "featured",
                          type: "checkbox",
                          class: "form__checkbox",
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      e[5] ||
                        (e[5] = o(
                          "label",
                          { class: "form__check__label", for: "featured" },
                          "Destacado",
                          -1,
                        )),
                    ]),
                  ]),
                  o("div", K, [
                    o(
                      "button",
                      {
                        disabled: n.value || !i.valid,
                        type: "submit",
                        class: "btn btn--primary",
                      },
                      O(A.value),
                      9,
                      W,
                    ),
                  ]),
                ]),
              ]),
              _: 1,
            },
            8,
            ["validation-schema"],
          )
        )
      );
    },
  }),
  ee = Object.assign(X, { __name: "FormFaq" });
export { ee as F };
//# sourceMappingURL=CP9GxK4v.js.map
