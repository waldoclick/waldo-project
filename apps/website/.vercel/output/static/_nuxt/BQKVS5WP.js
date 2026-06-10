import {
  aZ as $,
  bb as A,
  b2 as k,
  b3 as q,
  bc as z,
  bl as B,
  bd as w,
  be as N,
  a_ as O,
  b5 as R,
  b1 as U,
  bf as i,
  b0 as b,
  b6 as n,
  bg as I,
  bh as P,
  bi as j,
  bj as M,
  b8 as _,
  b9 as V,
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
    (a._sentryDebugIds[u] = "80b26bdf-ef8c-4607-aeab-3507e7517ae6"),
    (a._sentryDebugIdIdentifier =
      "sentry-dbid-80b26bdf-ef8c-4607-aeab-3507e7517ae6"));
} catch {}
const H = { class: "form form--policy" },
  L = { class: "form__group" },
  Z = { class: "form__group" },
  J = { class: "form__send" },
  K = ["disabled"],
  Q = $({
    __name: "FormPolicy",
    props: { policy: {} },
    emits: ["saved"],
    setup(a, { emit: u }) {
      const t = a,
        v = u,
        { Swal: m } = G(),
        f = A(),
        C = k(),
        y = q(),
        c = _(!1),
        x = _(null),
        D = z({
          title: w().required("Título es requerido"),
          text: w().required("Contenido es requerido"),
          order: B().nullable().default(null),
        }),
        d = _({ title: "", text: "", order: null }),
        g = V(() => !!(t.policy?.documentId || t.policy?.id)),
        F = V(() => (g.value ? "Actualizar Politica" : "Crear Politica")),
        S = () => {
          ((d.value = {
            title: t.policy?.title || "",
            text: t.policy?.text || "",
            order: t.policy?.order ?? null,
          }),
            (x.value = t.policy?.id || t.policy?.documentId || null));
        },
        T = async (o) => {
          c.value = !0;
          try {
            const e = {
              title: o.title.trim(),
              text: o.text.trim(),
              order: o.order ?? null,
            };
            if (g.value) {
              const s = C.params.id,
                r = t.policy?.documentId || (typeof s == "string" ? s : void 0);
              if (!r) {
                (await m.fire(
                  "Error",
                  "No se pudo identificar la Política para actualizar.",
                  "error",
                ),
                  (c.value = !1));
                return;
              }
              const l = (
                  await y(`/policies/${r}`, {
                    method: "PUT",
                    body: { data: e },
                  })
                ).data,
                p = { ...t.policy, ...l, ...e };
              ((d.value = { title: e.title, text: e.text, order: e.order }),
                v("saved", p),
                await m.fire(
                  "Éxito",
                  "Politica actualizada correctamente.",
                  "success",
                ));
              const h = l?.id || l?.documentId;
              h && f.push(`/dashboard/maintenance/policies/${h}`);
            } else {
              const s = await y("policies", {
                  method: "GET",
                  params: { sort: "order:desc", pagination: { pageSize: 1 } },
                }),
                r =
                  Array.isArray(s.data) && s.data[0]?.order != null
                    ? s.data[0].order
                    : 0;
              e.order = r + 1;
              const l = (
                await y("/policies", { method: "POST", body: { data: e } })
              ).data;
              (v("saved", l || {}),
                await m.fire(
                  "Éxito",
                  "Politica creada correctamente.",
                  "success",
                ));
              const p = l?.id || l?.documentId;
              p
                ? f.push(`/dashboard/maintenance/policies/${p}`)
                : f.push("/dashboard/maintenance/policies");
            }
          } catch {
            await m.fire("Error", "No se pudo guardar la Politica.", "error");
          } finally {
            c.value = !1;
          }
        };
      return (
        N(
          () => t.policy,
          (o) => {
            if (!o || c.value) return;
            const e = o.id || o.documentId || null;
            (e && e === x.value) || S();
          },
          { immediate: !0 },
        ),
        (o, e) => (
          O(),
          R(
            n(M),
            { "validation-schema": n(D), onSubmit: T },
            {
              default: U(({ meta: s }) => [
                i("div", H, [
                  i("div", L, [
                    e[2] ||
                      (e[2] = i(
                        "label",
                        { class: "form__label", for: "title" },
                        "Título",
                        -1,
                      )),
                    b(
                      n(I),
                      {
                        modelValue: d.value.title,
                        "onUpdate:modelValue":
                          e[0] || (e[0] = (r) => (d.value.title = r)),
                        name: "title",
                        type: "text",
                        class: "form__control",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    b(n(P), { name: "title" }),
                  ]),
                  i("div", Z, [
                    e[3] ||
                      (e[3] = i(
                        "label",
                        { class: "form__label", for: "text" },
                        "Contenido",
                        -1,
                      )),
                    b(
                      n(I),
                      {
                        modelValue: d.value.text,
                        "onUpdate:modelValue":
                          e[1] || (e[1] = (r) => (d.value.text = r)),
                        as: "textarea",
                        name: "text",
                        class: "form__control",
                        rows: "8",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    b(n(P), { name: "text" }),
                  ]),
                  i("div", J, [
                    i(
                      "button",
                      {
                        disabled: c.value || !s.valid,
                        type: "submit",
                        class: "btn btn--primary",
                      },
                      j(F.value),
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
  X = Object.assign(Q, { __name: "FormPolicy" });
export { X as F };
//# sourceMappingURL=BQKVS5WP.js.map
