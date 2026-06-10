import {
  aZ as V,
  bb as $,
  b2 as k,
  b3 as B,
  bc as T,
  bd as z,
  be as A,
  a_ as j,
  b5 as q,
  b1 as M,
  bf as d,
  b0 as I,
  b6 as u,
  bg as O,
  bh as P,
  bi as R,
  bj as U,
  b8 as p,
  b9 as w,
  bk as H,
} from "./BK8sApmn.js";
import { u as L } from "./DQVnk6X6.js";
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
    r = new a.Error().stack;
  r &&
    ((a._sentryDebugIds = a._sentryDebugIds || {}),
    (a._sentryDebugIds[r] = "f238d942-f550-43c3-ad26-8a86aa14572e"),
    (a._sentryDebugIdIdentifier =
      "sentry-dbid-f238d942-f550-43c3-ad26-8a86aa14572e"));
} catch {}
const Z = { class: "form form--condition" },
  G = { class: "form__group" },
  J = { class: "form__send" },
  K = ["disabled"],
  Q = V({
    __name: "FormCondition",
    props: { condition: {} },
    emits: ["saved"],
    setup(a, { emit: r }) {
      const n = a,
        _ = r,
        { Swal: c } = H(),
        m = $(),
        C = k(),
        y = B(),
        { toSlug: S } = L(),
        s = p(!1),
        h = p(null),
        D = T({ name: z().required("Nombre es requerido") }),
        l = p({ name: "" }),
        v = w(() => !!(n.condition?.documentId || n.condition?.id)),
        F = w(() => (v.value ? "Actualizar condición" : "Crear condición")),
        x = () => {
          ((l.value = { name: n.condition?.name || "" }),
            (h.value = n.condition?.id || n.condition?.documentId || null));
        },
        N = async (t) => {
          s.value = !0;
          try {
            const e = { name: t.name.trim(), slug: S(t.name) };
            if (v.value) {
              const i = C.params.id,
                o =
                  n.condition?.documentId ||
                  (typeof i == "string" ? i : void 0);
              if (!o) {
                (await c.fire(
                  "Error",
                  "No se pudo identificar la condición para actualizar.",
                  "error",
                ),
                  (s.value = !1));
                return;
              }
              const f = (
                  await y(`/conditions/${o}`, {
                    method: "PUT",
                    body: { data: e },
                  })
                ).data,
                E = { ...n.condition, ...f, name: e.name };
              ((l.value = { name: e.name }),
                _("saved", E),
                await c.fire(
                  "Éxito",
                  "Condición actualizada correctamente.",
                  "success",
                ));
              const g = f?.documentId || f?.id;
              g && m.push(`/dashboard/maintenance/conditions/${g}`);
            } else {
              const o = (
                await y("/conditions", { method: "POST", body: { data: e } })
              ).data;
              (_("saved", o || {}),
                await c.fire(
                  "Éxito",
                  "Condición creada correctamente.",
                  "success",
                ));
              const b = o?.documentId || o?.id;
              b
                ? m.push(`/dashboard/maintenance/conditions/${b}`)
                : m.push("/dashboard/maintenance/conditions");
            }
          } catch {
            await c.fire("Error", "No se pudo guardar la condición.", "error");
          } finally {
            s.value = !1;
          }
        };
      return (
        A(
          () => n.condition,
          (t) => {
            if (!t || s.value) return;
            const e = t.id || t.documentId || null;
            (e && e === h.value) || x();
          },
          { immediate: !0 },
        ),
        (t, e) => (
          j(),
          q(
            u(U),
            { "validation-schema": u(D), onSubmit: N },
            {
              default: M(({ meta: i }) => [
                d("div", Z, [
                  d("div", G, [
                    e[1] ||
                      (e[1] = d(
                        "label",
                        { class: "form__label", for: "name" },
                        "Nombre",
                        -1,
                      )),
                    I(
                      u(O),
                      {
                        modelValue: l.value.name,
                        "onUpdate:modelValue":
                          e[0] || (e[0] = (o) => (l.value.name = o)),
                        name: "name",
                        type: "text",
                        class: "form__control",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    I(u(P), { name: "name" }),
                  ]),
                  d("div", J, [
                    d(
                      "button",
                      {
                        disabled: s.value || !i.valid,
                        type: "submit",
                        class: "btn btn--primary",
                      },
                      R(F.value),
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
  Y = Object.assign(Q, { __name: "FormCondition" });
export { Y as F };
//# sourceMappingURL=aXTW6rfY.js.map
