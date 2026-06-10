import {
  aZ as U,
  bb as A,
  b2 as F,
  b3 as T,
  bc as z,
  bl as y,
  bd as B,
  be as R,
  a_ as j,
  b5 as M,
  b1 as O,
  bf as s,
  b0 as d,
  b6 as l,
  bg as p,
  bh as _,
  bi as G,
  bj as H,
  b8 as I,
  b9 as h,
  bk as L,
} from "./BK8sApmn.js";
try {
  let n =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    f = new n.Error().stack;
  f &&
    ((n._sentryDebugIds = n._sentryDebugIds || {}),
    (n._sentryDebugIds[f] = "78f90153-ed96-49bb-8e30-b524134555b9"),
    (n._sentryDebugIdIdentifier =
      "sentry-dbid-78f90153-ed96-49bb-8e30-b524134555b9"));
} catch {}
const Z = { class: "form form--pack" },
  J = { class: "form__group" },
  K = { class: "form__group" },
  Q = { class: "form__group" },
  W = { class: "form__group" },
  X = { class: "form__group" },
  Y = { class: "form__send" },
  aa = ["disabled"],
  ea = U({
    __name: "FormPackDashboard",
    props: { pack: {} },
    emits: ["saved"],
    setup(n, { emit: f }) {
      const o = n,
        w = f,
        { Swal: c } = L(),
        k = A(),
        E = F(),
        g = T(),
        u = I(!1),
        D = I(null),
        P = z({
          name: B().required("Nombre es requerido"),
          price: y()
            .typeError("Precio es requerido")
            .required("Precio es requerido"),
          total_days: y()
            .typeError("Duración es requerida")
            .required("Duración es requerida"),
          total_ads: y()
            .typeError("Cantidad de anuncios es requerida")
            .required("Cantidad de anuncios es requerida"),
          total_features: y()
            .typeError("Destacados es requerido")
            .required("Destacados es requerido"),
        }),
        r = I({
          name: "",
          price: "",
          total_days: "",
          total_ads: "",
          total_features: "",
        }),
        V = h(() => !!(o.pack?.documentId || o.pack?.id)),
        C = h(() => (V.value ? "Actualizar pack" : "Crear pack")),
        b = (t) => (t == null || t === "" ? null : Number(t)),
        N = () => {
          ((r.value = {
            name: o.pack?.name || "",
            price: o.pack?.price?.toString() ?? "",
            total_days: o.pack?.total_days?.toString() ?? "",
            total_ads: o.pack?.total_ads?.toString() ?? "",
            total_features: o.pack?.total_features?.toString() ?? "",
          }),
            (D.value = o.pack?.id || o.pack?.documentId || null));
        },
        x = async (t) => {
          u.value = !0;
          try {
            const a = {
              name: t.name.trim(),
              price: b(t.price),
              total_days: b(t.total_days),
              total_ads: b(t.total_ads),
              total_features: b(t.total_features),
            };
            if (
              a.price === null ||
              a.total_days === null ||
              a.total_ads === null ||
              a.total_features === null
            ) {
              (await c.fire(
                "Error",
                "Complete todos los campos requeridos.",
                "error",
              ),
                (u.value = !1));
              return;
            }
            if (V.value) {
              const m = E.params.id,
                e = o.pack?.documentId || (typeof m == "string" ? m : void 0);
              let i = o.pack?.id;
              if (!i && e) {
                const S = await g("ad-packs", {
                  method: "GET",
                  params: {
                    filters: { documentId: { $eq: e } },
                    pagination: { pageSize: 1 },
                  },
                });
                i = (Array.isArray(S.data) ? S.data : [])[0]?.id;
              }
              if (!i) {
                (await c.fire(
                  "Error",
                  "No se pudo identificar el pack para actualizar.",
                  "error",
                ),
                  (u.value = !1));
                return;
              }
              const v = (
                  await g(`/ad-packs/${i}`, {
                    method: "PUT",
                    body: { data: a },
                  })
                ).data,
                $ = { ...o.pack, ...v, ...a };
              ((r.value = {
                name: a.name,
                price: a.price.toString(),
                total_days: a.total_days.toString(),
                total_ads: a.total_ads.toString(),
                total_features: a.total_features.toString(),
              }),
                w("saved", $),
                await c.fire(
                  "Éxito",
                  "Pack actualizado correctamente.",
                  "success",
                ));
              const q = v?.documentId || v?.id;
              q && k.push(`/dashboard/maintenance/packs/${q}`);
            } else {
              const e = (
                await g("/ad-packs", { method: "POST", body: { data: a } })
              ).data;
              (w("saved", e || {}),
                await c.fire("Éxito", "Pack creado correctamente.", "success"));
              const i = e?.documentId || e?.id;
              i
                ? k.push(`/dashboard/maintenance/packs/${i}`)
                : k.push("/dashboard/maintenance/packs");
            }
          } catch {
            await c.fire("Error", "No se pudo guardar el pack.", "error");
          } finally {
            u.value = !1;
          }
        };
      return (
        R(
          () => o.pack,
          (t) => {
            if (!t || u.value) return;
            const a = t.id || t.documentId || null;
            (a && a === D.value) || N();
          },
          { immediate: !0 },
        ),
        (t, a) => (
          j(),
          M(
            l(H),
            { "validation-schema": l(P), onSubmit: x },
            {
              default: O(({ meta: m }) => [
                s("div", Z, [
                  s("div", J, [
                    a[5] ||
                      (a[5] = s(
                        "label",
                        { class: "form__label", for: "name" },
                        "Nombre",
                        -1,
                      )),
                    d(
                      l(p),
                      {
                        modelValue: r.value.name,
                        "onUpdate:modelValue":
                          a[0] || (a[0] = (e) => (r.value.name = e)),
                        name: "name",
                        type: "text",
                        class: "form__control",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    d(l(_), { name: "name" }),
                  ]),
                  s("div", K, [
                    a[6] ||
                      (a[6] = s(
                        "label",
                        { class: "form__label", for: "price" },
                        "Precio",
                        -1,
                      )),
                    d(
                      l(p),
                      {
                        modelValue: r.value.price,
                        "onUpdate:modelValue":
                          a[1] || (a[1] = (e) => (r.value.price = e)),
                        name: "price",
                        type: "number",
                        class: "form__control",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    d(l(_), { name: "price" }),
                  ]),
                  s("div", Q, [
                    a[7] ||
                      (a[7] = s(
                        "label",
                        { class: "form__label", for: "total_days" },
                        "Duración (días)",
                        -1,
                      )),
                    d(
                      l(p),
                      {
                        modelValue: r.value.total_days,
                        "onUpdate:modelValue":
                          a[2] || (a[2] = (e) => (r.value.total_days = e)),
                        name: "total_days",
                        type: "number",
                        class: "form__control",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    d(l(_), { name: "total_days" }),
                  ]),
                  s("div", W, [
                    a[8] ||
                      (a[8] = s(
                        "label",
                        { class: "form__label", for: "total_ads" },
                        "Cantidad de anuncios",
                        -1,
                      )),
                    d(
                      l(p),
                      {
                        modelValue: r.value.total_ads,
                        "onUpdate:modelValue":
                          a[3] || (a[3] = (e) => (r.value.total_ads = e)),
                        name: "total_ads",
                        type: "number",
                        class: "form__control",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    d(l(_), { name: "total_ads" }),
                  ]),
                  s("div", X, [
                    a[9] ||
                      (a[9] = s(
                        "label",
                        { class: "form__label", for: "total_features" },
                        "Destacados",
                        -1,
                      )),
                    d(
                      l(p),
                      {
                        modelValue: r.value.total_features,
                        "onUpdate:modelValue":
                          a[4] || (a[4] = (e) => (r.value.total_features = e)),
                        name: "total_features",
                        type: "number",
                        class: "form__control",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    d(l(_), { name: "total_features" }),
                  ]),
                  s("div", Y, [
                    s(
                      "button",
                      {
                        disabled: u.value || !m.valid,
                        type: "submit",
                        class: "btn btn--primary",
                      },
                      G(C.value),
                      9,
                      aa,
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
  ra = Object.assign(ea, { __name: "FormPackDashboard" });
export { ra as _ };
//# sourceMappingURL=Bjk732Ik.js.map
