import {
  aZ as q,
  bb as B,
  b2 as T,
  b3 as z,
  bc as A,
  bd as w,
  be as U,
  a_ as j,
  b5 as M,
  b1 as O,
  bf as s,
  b0 as m,
  b6 as d,
  bg as C,
  bh as F,
  bi as P,
  bj as R,
  b8 as p,
  b9 as S,
  bk as H,
} from "./BK8sApmn.js";
import { u as L } from "./DQVnk6X6.js";
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
    i = new t.Error().stack;
  i &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[i] = "39007d60-e9cb-4040-a805-3d45a12d4e3e"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-39007d60-e9cb-4040-a805-3d45a12d4e3e"));
} catch {}
const Z = { class: "form form--category" },
  G = { class: "form__group" },
  J = { class: "form__group" },
  K = { class: "form__send" },
  Q = ["disabled"],
  W = q({
    __name: "FormCategory",
    props: { category: {} },
    emits: ["saved"],
    setup(t, { emit: i }) {
      const o = t,
        y = i,
        { Swal: u } = H(),
        b = B(),
        V = T(),
        _ = z(),
        { toSlug: x } = L(),
        l = p(!1),
        v = p(null),
        D = A({
          name: w().required("Nombre es requerido"),
          color: w().required("Color es requerido"),
        }),
        n = p({ name: "", color: "" }),
        h = S(() => !!(o.category?.documentId || o.category?.id)),
        N = S(() => (h.value ? "Actualizar categoría" : "Crear categoría")),
        E = () => {
          ((n.value = {
            name: o.category?.name || "",
            color: o.category?.color || "",
          }),
            (v.value = o.category?.id || o.category?.documentId || null));
        },
        $ = async (r) => {
          l.value = !0;
          try {
            const e = {
              name: r.name.trim(),
              color: r.color.trim(),
              slug: x(r.name),
            };
            if (h.value) {
              const c = V.params.id,
                a =
                  o.category?.documentId || (typeof c == "string" ? c : void 0);
              if (!a) {
                (await u.fire(
                  "Error",
                  "No se pudo identificar la categoría para actualizar.",
                  "error",
                ),
                  (l.value = !1));
                return;
              }
              const k = (
                  await _(`/categories/${a}`, {
                    method: "PUT",
                    body: { data: e },
                  })
                ).data,
                g = { ...o.category, ...k, name: e.name, color: e.color };
              ((n.value = { name: e.name, color: e.color }),
                y("saved", g),
                await u.fire(
                  "Éxito",
                  "Categoría actualizada correctamente.",
                  "success",
                ));
              const I = g?.documentId || g?.id;
              I && b.push(`/dashboard/maintenance/categories/${I}`);
            } else {
              const a = (
                await _("/categories", { method: "POST", body: { data: e } })
              ).data;
              (y("saved", a || {}),
                await u.fire(
                  "Éxito",
                  "Categoría creada correctamente.",
                  "success",
                ));
              const f = a?.documentId || a?.id;
              f
                ? b.push(`/dashboard/maintenance/categories/${f}`)
                : b.push("/dashboard/maintenance/categories");
            }
          } catch {
            await u.fire("Error", "No se pudo guardar la categoría.", "error");
          } finally {
            l.value = !1;
          }
        };
      return (
        U(
          () => o.category,
          (r) => {
            if (!r || l.value) return;
            const e = r.id || r.documentId || null;
            (e && e === v.value) || E();
          },
          { immediate: !0 },
        ),
        (r, e) => (
          j(),
          M(
            d(R),
            { "validation-schema": d(D), onSubmit: $ },
            {
              default: O(({ meta: c }) => [
                s("div", Z, [
                  s("div", G, [
                    e[2] ||
                      (e[2] = s(
                        "label",
                        { class: "form__label", for: "name" },
                        "Nombre",
                        -1,
                      )),
                    m(
                      d(C),
                      {
                        modelValue: n.value.name,
                        "onUpdate:modelValue":
                          e[0] || (e[0] = (a) => (n.value.name = a)),
                        name: "name",
                        type: "text",
                        class: "form__control",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    m(d(F), { name: "name" }),
                  ]),
                  s("div", J, [
                    e[3] ||
                      (e[3] = s(
                        "label",
                        { class: "form__label", for: "color" },
                        "Color",
                        -1,
                      )),
                    m(
                      d(C),
                      {
                        modelValue: n.value.color,
                        "onUpdate:modelValue":
                          e[1] || (e[1] = (a) => (n.value.color = a)),
                        name: "color",
                        type: "text",
                        class: "form__control",
                        placeholder: "#FFFFFF",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    m(d(F), { name: "color" }),
                  ]),
                  s("div", K, [
                    s(
                      "button",
                      {
                        disabled: l.value || !c.valid,
                        type: "submit",
                        class: "btn btn--primary",
                      },
                      P(N.value),
                      9,
                      Q,
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
  ee = Object.assign(W, { __name: "FormCategory" });
export { ee as F };
//# sourceMappingURL=6bVI6abF.js.map
