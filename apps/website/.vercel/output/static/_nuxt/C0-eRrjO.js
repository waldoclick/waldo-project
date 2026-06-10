import {
  aZ as V,
  be as C,
  a_ as p,
  a$ as v,
  bG as T,
  bV as G,
  bf as o,
  bn as A,
  bo as E,
  b7 as I,
  b8 as b,
  bO as F,
  bi as q,
  b3 as D,
  bc as M,
  bd as N,
  bl as U,
  b5 as j,
  b1 as L,
  b0 as h,
  b6 as y,
  bg as k,
  bh as S,
  bj as R,
  b9 as z,
  bk as Q,
  bC as P,
  bQ as X,
} from "./BK8sApmn.js";
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
    u = new e.Error().stack;
  u &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[u] = "ab624131-939c-48c2-a96b-b145c42bb46b"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-ab624131-939c-48c2-a96b-b145c42bb46b"));
} catch {}
const Z = { class: "input input--autocomplete" },
  H = ["placeholder"],
  J = { key: 0, class: "input--autocomplete__dropdown" },
  K = ["onMousedown"],
  W = { key: 1, class: "input--autocomplete__empty" },
  Y = { key: 2, class: "input--autocomplete__empty" },
  ee = V({
    __name: "InputAutocomplete",
    props: {
      modelValue: {},
      options: {},
      placeholder: {},
      loading: { type: Boolean },
    },
    emits: ["update:modelValue", "search"],
    setup(e, { emit: u }) {
      const f = e,
        r = u,
        a = b(""),
        s = b(!1),
        i = b(null);
      let d = null;
      function c() {
        (r("update:modelValue", ""),
          (s.value = !0),
          d && clearTimeout(d),
          (d = setTimeout(() => {
            r("search", a.value.trim());
          }, 300)));
      }
      function w(_) {
        ((a.value = _.label), r("update:modelValue", _.value), (s.value = !1));
      }
      function l() {
        setTimeout(() => {
          s.value = !1;
        }, 150);
      }
      return (
        C(
          () => f.modelValue,
          (_) => {
            _ === "" && (a.value = "");
          },
        ),
        (_, $) => (
          p(),
          v("div", Z, [
            T(
              o(
                "input",
                {
                  ref_key: "inputRef",
                  ref: i,
                  "onUpdate:modelValue": $[0] || ($[0] = (m) => (a.value = m)),
                  type: "text",
                  class: "form__control",
                  placeholder: e.placeholder,
                  autocomplete: "off",
                  onFocus: $[1] || ($[1] = (m) => (s.value = !0)),
                  onBlur: l,
                  onInput: c,
                },
                null,
                40,
                H,
              ),
              [[G, a.value]],
            ),
            s.value && e.options.length > 0
              ? (p(),
                v("ul", J, [
                  (p(!0),
                  v(
                    A,
                    null,
                    E(
                      e.options,
                      (m) => (
                        p(),
                        v(
                          "li",
                          {
                            key: m.value,
                            class: "input--autocomplete__dropdown__item",
                            onMousedown: F((B) => w(m), ["prevent"]),
                          },
                          q(m.label),
                          41,
                          K,
                        )
                      ),
                    ),
                    128,
                  )),
                ]))
              : I("", !0),
            s.value &&
            a.value.length >= 2 &&
            !e.loading &&
            e.options.length === 0
              ? (p(), v("p", W, " Sin resultados "))
              : I("", !0),
            s.value && e.loading && a.value.length >= 2
              ? (p(), v("p", Y, " Buscando... "))
              : I("", !0),
          ])
        )
      );
    },
  }),
  te = Object.assign(ee, { __name: "InputAutocomplete" }),
  ae = { class: "form form--gift" },
  ne = { class: "form__group" },
  oe = { class: "form__group form__group--upload" },
  se = { class: "form__send" },
  le = ["disabled"],
  ie = V({
    __name: "FormGift",
    props: { endpoint: {}, label: {}, isOpen: { type: Boolean } },
    emits: ["gifted"],
    setup(e, { emit: u }) {
      const f = e,
        r = u,
        { Swal: a } = Q(),
        s = D(),
        i = b([]),
        d = b(!1),
        c = b(!1),
        w = b(""),
        l = b({ quantity: "1", userId: "" }),
        _ = M({
          quantity: U()
            .typeError("Cantidad es requerida")
            .min(1, "Mínimo 1")
            .required("Cantidad es requerida"),
          userId: N().required("Selecciona un usuario"),
        }),
        $ = z(() =>
          i.value.map((t) => ({
            label: `${t.firstname} ${t.lastname}`.trim() || "(sin nombre)",
            value: String(t.id),
          })),
        );
      async function m(t) {
        if (!t || t.trim().length < 2) {
          i.value = [];
          return;
        }
        d.value = !0;
        try {
          const g = await s("users", {
            method: "GET",
            params: {
              filters: {
                $and: [
                  { role: { type: { $eq: "authenticated" } } },
                  {
                    $or: [
                      { firstname: { $containsi: t } },
                      { lastname: { $containsi: t } },
                      { username: { $containsi: t } },
                    ],
                  },
                ],
              },
              fields: ["id", "firstname", "lastname", "username"],
              pagination: { pageSize: 20 },
            },
          });
          i.value = Array.isArray(g) ? g : (g.data ?? []);
        } catch {
          i.value = [];
        } finally {
          d.value = !1;
        }
      }
      async function B() {
        const t = Number(l.value.quantity),
          n = Number(l.value.userId),
          { isConfirmed: g } = await a.fire({
            title: "¿Confirmar regalo?",
            text: `Vas a regalar ${t} ${f.label} al usuario seleccionado.`,
            icon: "question",
            showCancelButton: !0,
            confirmButtonText: "Sí, regalar",
            cancelButtonText: "Cancelar",
          });
        if (g) {
          c.value = !0;
          try {
            (await s(`/${f.endpoint}/gift`, {
              method: "POST",
              body: { userId: n, quantity: t },
            }),
              r("gifted"));
          } catch {
            await a.fire("Error", "No se pudo enviar el regalo.", "error");
          } finally {
            c.value = !1;
          }
        }
      }
      return (
        C(
          () => f.isOpen,
          (t) => {
            t &&
              ((l.value = { quantity: "1", userId: "" }),
              (i.value = []),
              (w.value = ""));
          },
          { immediate: !0 },
        ),
        (t, n) => {
          const g = te;
          return (
            p(),
            j(
              y(R),
              { "validation-schema": y(_), onSubmit: B },
              {
                default: L(({ meta: O }) => [
                  o("div", ae, [
                    o("div", ne, [
                      n[3] ||
                        (n[3] = o(
                          "label",
                          { class: "form__label", for: "gift-quantity" },
                          "Cantidad",
                          -1,
                        )),
                      h(
                        y(k),
                        {
                          id: "gift-quantity",
                          modelValue: l.value.quantity,
                          "onUpdate:modelValue":
                            n[0] || (n[0] = (x) => (l.value.quantity = x)),
                          name: "quantity",
                          type: "number",
                          min: "1",
                          class: "form__control",
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      h(y(S), { name: "quantity" }),
                    ]),
                    o("div", oe, [
                      n[4] ||
                        (n[4] = o(
                          "label",
                          { class: "form__label" },
                          "Usuario",
                          -1,
                        )),
                      h(
                        y(k),
                        {
                          modelValue: l.value.userId,
                          "onUpdate:modelValue":
                            n[1] || (n[1] = (x) => (l.value.userId = x)),
                          name: "userId",
                          type: "hidden",
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      h(
                        g,
                        {
                          modelValue: l.value.userId,
                          "onUpdate:modelValue":
                            n[2] || (n[2] = (x) => (l.value.userId = x)),
                          options: $.value,
                          loading: d.value,
                          placeholder: "Buscar por nombre...",
                          onSearch: m,
                        },
                        null,
                        8,
                        ["modelValue", "options", "loading"],
                      ),
                      h(y(S), { name: "userId" }),
                    ]),
                    o("div", se, [
                      o(
                        "button",
                        {
                          disabled: c.value || !O.valid,
                          type: "submit",
                          class: "btn btn--primary",
                        },
                        q(c.value ? "Enviando..." : "Regalar"),
                        9,
                        le,
                      ),
                    ]),
                  ]),
                ]),
                _: 1,
              },
              8,
              ["validation-schema"],
            )
          );
        }
      );
    },
  }),
  ue = Object.assign(ie, { __name: "FormGift" }),
  re = { class: "lightbox--gift__box", role: "dialog", "aria-modal": "true" },
  de = { class: "lightbox--gift__header" },
  ce = { class: "lightbox--gift__header__title" },
  me = V({
    __name: "LightboxGift",
    props: { isOpen: { type: Boolean }, endpoint: {}, label: {} },
    emits: ["close", "gifted"],
    setup(e, { emit: u }) {
      const f = e,
        r = u;
      C(
        () => f.isOpen,
        (i) => {
          document.body.style.overflow = i ? "hidden" : "";
        },
      );
      function a() {
        ((document.body.style.overflow = ""), r("close"));
      }
      function s() {
        (r("gifted"), a());
      }
      return (i, d) => {
        const c = ue;
        return (
          p(),
          v(
            "div",
            { class: P([{ "is-open": e.isOpen }, "lightbox lightbox--gift"]) },
            [
              o("div", { class: "lightbox--gift__backdrop", onClick: a }),
              o("div", re, [
                o(
                  "button",
                  {
                    title: "Cerrar",
                    type: "button",
                    class: "lightbox__button",
                    onClick: a,
                  },
                  [h(y(X), { size: 24 })],
                ),
                o("div", de, [o("div", ce, "Regalar " + q(e.label), 1)]),
                h(
                  c,
                  {
                    endpoint: e.endpoint,
                    label: e.label,
                    "is-open": e.isOpen,
                    onGifted: s,
                  },
                  null,
                  8,
                  ["endpoint", "label", "is-open"],
                ),
              ]),
            ],
            2,
          )
        );
      };
    },
  }),
  be = Object.assign(me, { __name: "LightboxGift" });
export { be as _ };
//# sourceMappingURL=C0-eRrjO.js.map
