import {
  aZ as A,
  bb as U,
  b2 as k,
  b3 as q,
  bc as z,
  bl as B,
  bd as w,
  be as N,
  a_ as O,
  b5 as R,
  b1 as j,
  bf as n,
  b0 as f,
  b6 as i,
  bg as I,
  bh as C,
  bi as M,
  bj as P,
  b8 as y,
  b9 as T,
  bk as G,
} from "./BK8sApmn.js";
try {
  let a =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    u = new a.Error().stack;
  u &&
    ((a._sentryDebugIds = a._sentryDebugIds || {}),
    (a._sentryDebugIds[u] = "9385cf89-05c9-41cb-a200-7d2c0385c28d"),
    (a._sentryDebugIdIdentifier =
      "sentry-dbid-9385cf89-05c9-41cb-a200-7d2c0385c28d"));
} catch {}
const H = { class: "form form--term" },
  L = { class: "form__group" },
  Z = { class: "form__group" },
  J = { class: "form__send" },
  K = ["disabled"],
  Q = A({
    __name: "FormTerm",
    props: { term: {} },
    emits: ["saved"],
    setup(a, { emit: u }) {
      const t = a,
        v = u,
        { Swal: m } = G(),
        p = U(),
        V = k(),
        _ = q(),
        c = y(!1),
        x = y(null),
        D = z({
          title: w().required("Título es requerido"),
          text: w().required("Contenido es requerido"),
          order: B().nullable().default(null),
        }),
        l = y({ title: "", text: "", order: null }),
        g = T(() => !!(t.term?.documentId || t.term?.id)),
        F = T(() =>
          g.value ? "Actualizar Condicion de Uso" : "Crear Condicion de Uso",
        ),
        S = () => {
          ((l.value = {
            title: t.term?.title || "",
            text: t.term?.text || "",
            order: t.term?.order ?? null,
          }),
            (x.value = t.term?.id || t.term?.documentId || null));
        },
        E = async (r) => {
          c.value = !0;
          try {
            const e = {
              title: r.title.trim(),
              text: r.text.trim(),
              order: r.order ?? null,
            };
            if (g.value) {
              const o = V.params.id,
                s = t.term?.documentId || (typeof o == "string" ? o : void 0);
              if (!s) {
                (await m.fire(
                  "Error",
                  "No se pudo identificar el Término para actualizar.",
                  "error",
                ),
                  (c.value = !1));
                return;
              }
              const d = (
                  await _(`/terms/${s}`, { method: "PUT", body: { data: e } })
                ).data,
                b = { ...t.term, ...d, ...e };
              ((l.value = { title: e.title, text: e.text, order: e.order }),
                v("saved", b),
                await m.fire(
                  "Éxito",
                  "Condicion actualizada correctamente.",
                  "success",
                ));
              const h = d?.id || d?.documentId;
              h && p.push(`/dashboard/maintenance/terms/${h}`);
            } else {
              const o = await _("terms", {
                  method: "GET",
                  params: { sort: "order:desc", pagination: { pageSize: 1 } },
                }),
                s =
                  Array.isArray(o.data) && o.data[0]?.order != null
                    ? o.data[0].order
                    : 0;
              e.order = s + 1;
              const d = (
                await _("/terms", { method: "POST", body: { data: e } })
              ).data;
              (v("saved", d || {}),
                await m.fire(
                  "Éxito",
                  "Condicion creada correctamente.",
                  "success",
                ));
              const b = d?.id || d?.documentId;
              b
                ? p.push(`/dashboard/maintenance/terms/${b}`)
                : p.push("/dashboard/maintenance/terms");
            }
          } catch {
            await m.fire("Error", "No se pudo guardar la Condicion.", "error");
          } finally {
            c.value = !1;
          }
        };
      return (
        N(
          () => t.term,
          (r) => {
            if (!r || c.value) return;
            const e = r.id || r.documentId || null;
            (e && e === x.value) || S();
          },
          { immediate: !0 },
        ),
        (r, e) => (
          O(),
          R(
            i(P),
            { "validation-schema": i(D), onSubmit: E },
            {
              default: j(({ meta: o }) => [
                n("div", H, [
                  n("div", L, [
                    e[2] ||
                      (e[2] = n(
                        "label",
                        { class: "form__label", for: "title" },
                        "Título",
                        -1,
                      )),
                    f(
                      i(I),
                      {
                        modelValue: l.value.title,
                        "onUpdate:modelValue":
                          e[0] || (e[0] = (s) => (l.value.title = s)),
                        name: "title",
                        type: "text",
                        class: "form__control",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    f(i(C), { name: "title" }),
                  ]),
                  n("div", Z, [
                    e[3] ||
                      (e[3] = n(
                        "label",
                        { class: "form__label", for: "text" },
                        "Contenido",
                        -1,
                      )),
                    f(
                      i(I),
                      {
                        modelValue: l.value.text,
                        "onUpdate:modelValue":
                          e[1] || (e[1] = (s) => (l.value.text = s)),
                        as: "textarea",
                        name: "text",
                        class: "form__control",
                        rows: "8",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    f(i(C), { name: "text" }),
                  ]),
                  n("div", J, [
                    n(
                      "button",
                      {
                        disabled: c.value || !o.valid,
                        type: "submit",
                        class: "btn btn--primary",
                      },
                      M(F.value),
                      9,
                      K,
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
  X = Object.assign(Q, { __name: "FormTerm" });
export { X as F };
//# sourceMappingURL=D25bJp4A.js.map
