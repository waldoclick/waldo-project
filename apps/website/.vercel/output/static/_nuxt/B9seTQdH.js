import {
  aZ as E,
  bb as V,
  b2 as $,
  b3 as k,
  bc as B,
  bd as T,
  be as z,
  a_ as A,
  b5 as j,
  b1 as q,
  bf as i,
  b0 as I,
  b6 as u,
  bg as M,
  bh as O,
  bi as P,
  bj as U,
  b8 as g,
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
    d = new a.Error().stack;
  d &&
    ((a._sentryDebugIds = a._sentryDebugIds || {}),
    (a._sentryDebugIds[d] = "58a704a9-3a79-4e8e-9ae4-f2afc00580de"),
    (a._sentryDebugIdIdentifier =
      "sentry-dbid-58a704a9-3a79-4e8e-9ae4-f2afc00580de"));
} catch {}
const Z = { class: "form form--region" },
  G = { class: "form__group" },
  J = { class: "form__send" },
  K = ["disabled"],
  Q = E({
    __name: "FormRegion",
    props: { region: {} },
    emits: ["saved"],
    setup(a, { emit: d }) {
      const n = a,
        p = d,
        { Swal: c } = H(),
        m = V(),
        R = $(),
        _ = k(),
        { toSlug: S } = L(),
        s = g(!1),
        y = g(null),
        D = B({ name: T().required("Nombre es requerido") }),
        l = g({ name: "" }),
        h = w(() => !!(n.region?.documentId || n.region?.id)),
        F = w(() => (h.value ? "Actualizar región" : "Crear región")),
        x = () => {
          ((l.value = { name: n.region?.name || "" }),
            (y.value = n.region?.id || n.region?.documentId || null));
        },
        N = async (t) => {
          s.value = !0;
          try {
            const e = { name: t.name.trim(), slug: S(t.name) };
            if (h.value) {
              const r = R.params.id,
                o = n.region?.documentId || (typeof r == "string" ? r : void 0);
              if (!o) {
                (await c.fire(
                  "Error",
                  "No se pudo identificar la región para actualizar.",
                  "error",
                ),
                  (s.value = !1));
                return;
              }
              const f = (
                  await _(`/regions/${o}`, { method: "PUT", body: { data: e } })
                ).data,
                C = { ...n.region, ...f, name: e.name };
              ((l.value = { name: e.name }),
                p("saved", C),
                await c.fire(
                  "Éxito",
                  "Región actualizada correctamente.",
                  "success",
                ));
              const v = f?.documentId || f?.id;
              v && m.push(`/dashboard/maintenance/regions/${v}`);
            } else {
              const o = (
                await _("/regions", { method: "POST", body: { data: e } })
              ).data;
              (p("saved", o || {}),
                await c.fire(
                  "Éxito",
                  "Región creada correctamente.",
                  "success",
                ));
              const b = o?.documentId || o?.id;
              b
                ? m.push(`/dashboard/maintenance/regions/${b}`)
                : m.push("/dashboard/maintenance/regions");
            }
          } catch {
            await c.fire("Error", "No se pudo guardar la región.", "error");
          } finally {
            s.value = !1;
          }
        };
      return (
        z(
          () => n.region,
          (t) => {
            if (!t || s.value) return;
            const e = t.id || t.documentId || null;
            (e && e === y.value) || x();
          },
          { immediate: !0 },
        ),
        (t, e) => (
          A(),
          j(
            u(U),
            { "validation-schema": u(D), onSubmit: N },
            {
              default: q(({ meta: r }) => [
                i("div", Z, [
                  i("div", G, [
                    e[1] ||
                      (e[1] = i(
                        "label",
                        { class: "form__label", for: "name" },
                        "Nombre",
                        -1,
                      )),
                    I(
                      u(M),
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
                    I(u(O), { name: "name" }),
                  ]),
                  i("div", J, [
                    i(
                      "button",
                      {
                        disabled: s.value || !r.valid,
                        type: "submit",
                        class: "btn btn--primary",
                      },
                      P(F.value),
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
  Y = Object.assign(Q, { __name: "FormRegion" });
export { Y as F };
//# sourceMappingURL=B9seTQdH.js.map
