import {
  aZ as M,
  bb as U,
  b2 as j,
  b3 as L,
  bc as O,
  bl as P,
  bd as G,
  be as H,
  bm as Z,
  a_ as v,
  b5 as J,
  b1 as C,
  bf as r,
  b0 as l,
  b6 as m,
  bg as E,
  bh as F,
  a$ as N,
  bn as K,
  bo as Q,
  bi as R,
  bj as W,
  b8 as b,
  b9 as V,
  bk as X,
} from "./BK8sApmn.js";
import { u as Y } from "./DQVnk6X6.js";
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
    c = new t.Error().stack;
  c &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[c] = "4e82b718-9bc7-4e7d-927e-12250a9dcecb"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-4e82b718-9bc7-4e7d-927e-12250a9dcecb"));
} catch {}
const ee = { class: "form form--commune" },
  ae = { class: "form__group" },
  oe = { class: "form__group" },
  ne = ["value"],
  te = { class: "form__send" },
  re = ["disabled"],
  se = M({
    __name: "FormCommune",
    props: { commune: {} },
    emits: ["saved"],
    setup(t, { emit: c }) {
      const n = t,
        h = c,
        { Swal: d } = X(),
        f = U(),
        D = j(),
        g = L(),
        { toSlug: $ } = Y(),
        p = b([]),
        s = b(!1),
        w = b(null),
        k = O({
          name: G().required("Nombre es requerido"),
          region: P()
            .typeError("Región es requerida")
            .required("Región es requerida"),
        }),
        i = b({ name: "", region: "" }),
        I = V(() => !!(n.commune?.documentId || n.commune?.id)),
        q = V(() => (I.value ? "Actualizar comuna" : "Crear comuna")),
        x = (a) => (a == null || a === "" ? "" : Number(a)),
        z = () => {
          ((i.value = {
            name: n.commune?.name || "",
            region: n.commune?.region?.id?.toString() ?? "",
          }),
            (w.value = n.commune?.id || n.commune?.documentId || null));
        },
        A = async () => {
          try {
            const a = await g("regions", {
              method: "GET",
              params: { pagination: { pageSize: 200 }, sort: "name:asc" },
            });
            p.value = Array.isArray(a.data) ? a.data : [];
          } catch {
            p.value = [];
          }
        },
        B = async (a) => {
          s.value = !0;
          try {
            const e = {
              name: a.name.trim(),
              region: x(a.region),
              slug: $(a.name),
            };
            if (!e.region) {
              (await d.fire("Error", "Región es requerida.", "error"),
                (s.value = !1));
              return;
            }
            if (I.value) {
              const u = D.params.id,
                o =
                  n.commune?.documentId || (typeof u == "string" ? u : void 0);
              if (!o) {
                (await d.fire(
                  "Error",
                  "No se pudo identificar la comuna para actualizar.",
                  "error",
                ),
                  (s.value = !1));
                return;
              }
              const _ = (
                  await g(`/communes/${o}`, {
                    method: "PUT",
                    body: { data: e },
                  })
                ).data,
                T = {
                  ...n.commune,
                  ..._,
                  name: e.name,
                  region: {
                    id:
                      typeof e.region == "number" ? e.region : Number(e.region),
                  },
                };
              ((i.value = { name: e.name, region: e.region.toString() }),
                h("saved", T),
                await d.fire(
                  "Éxito",
                  "Comuna actualizada correctamente.",
                  "success",
                ));
              const S = _?.documentId || _?.id;
              S && f.push(`/dashboard/maintenance/communes/${S}`);
            } else {
              const o = (
                await g("/communes", { method: "POST", body: { data: e } })
              ).data;
              (h("saved", o || {}),
                await d.fire(
                  "Éxito",
                  "Comuna creada correctamente.",
                  "success",
                ));
              const y = o?.documentId || o?.id;
              y
                ? f.push(`/dashboard/maintenance/communes/${y}`)
                : f.push("/dashboard/maintenance/communes");
            }
          } catch {
            await d.fire("Error", "No se pudo guardar la comuna.", "error");
          } finally {
            s.value = !1;
          }
        };
      return (
        H(
          () => n.commune,
          (a) => {
            if (!a || s.value) return;
            const e = a.id || a.documentId || null;
            (e && e === w.value) || z();
          },
          { immediate: !0 },
        ),
        Z(async () => {
          await A();
        }),
        (a, e) => (
          v(),
          J(
            m(W),
            { "validation-schema": m(k), onSubmit: B },
            {
              default: C(({ meta: u }) => [
                r("div", ee, [
                  r("div", ae, [
                    e[2] ||
                      (e[2] = r(
                        "label",
                        { class: "form__label", for: "name" },
                        "Nombre",
                        -1,
                      )),
                    l(
                      m(E),
                      {
                        modelValue: i.value.name,
                        "onUpdate:modelValue":
                          e[0] || (e[0] = (o) => (i.value.name = o)),
                        name: "name",
                        type: "text",
                        class: "form__control",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    l(m(F), { name: "name" }),
                  ]),
                  r("div", oe, [
                    e[4] ||
                      (e[4] = r(
                        "label",
                        { class: "form__label", for: "region" },
                        "Región",
                        -1,
                      )),
                    l(
                      m(E),
                      {
                        modelValue: i.value.region,
                        "onUpdate:modelValue":
                          e[1] || (e[1] = (o) => (i.value.region = o)),
                        as: "select",
                        name: "region",
                        class: "form__control",
                      },
                      {
                        default: C(() => [
                          e[3] ||
                            (e[3] = r(
                              "option",
                              { value: "" },
                              "Seleccione una región",
                              -1,
                            )),
                          (v(!0),
                          N(
                            K,
                            null,
                            Q(
                              p.value,
                              (o) => (
                                v(),
                                N(
                                  "option",
                                  { key: o.id, value: o.id },
                                  R(o.name),
                                  9,
                                  ne,
                                )
                              ),
                            ),
                            128,
                          )),
                        ]),
                        _: 1,
                      },
                      8,
                      ["modelValue"],
                    ),
                    l(m(F), { name: "region" }),
                  ]),
                  r("div", te, [
                    r(
                      "button",
                      {
                        disabled: s.value || !u.valid,
                        type: "submit",
                        class: "btn btn--primary",
                      },
                      R(q.value),
                      9,
                      re,
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
  de = Object.assign(se, { __name: "FormCommune" });
export { de as F };
//# sourceMappingURL=BT44QAAr.js.map
