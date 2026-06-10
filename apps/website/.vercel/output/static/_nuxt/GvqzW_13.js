import { _ as T } from "./vgLiQXkW.js";
import { _ as B, a as I } from "./RoATBwxO.js";
import {
  aZ as $,
  b3 as q,
  bx as U,
  bc as D,
  bd as w,
  by as O,
  a_ as t,
  b5 as E,
  b1 as h,
  bf as e,
  b0 as s,
  b6 as o,
  bg as v,
  a$ as d,
  bh as y,
  bj as M,
  b8 as f,
  bk as N,
  bz as A,
} from "./BK8sApmn.js";
import "./CNKn_OHC.js";
try {
  let m =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    u = new m.Error().stack;
  u &&
    ((m._sentryDebugIds = m._sentryDebugIds || {}),
    (m._sentryDebugIds[u] = "01f59413-b8f0-4c97-9a19-059516ee4f5b"),
    (m._sentryDebugIdIdentifier =
      "sentry-dbid-01f59413-b8f0-4c97-9a19-059516ee4f5b"));
} catch {}
const H = { class: "form form--password" },
  j = { class: "form__group form__group--password" },
  z = { key: 0 },
  G = { key: 1 },
  L = { class: "form__group form__group--password" },
  K = { key: 0 },
  R = { key: 1 },
  Z = { class: "form__group form__group--password" },
  J = { key: 0 },
  Q = { key: 1 },
  W = { class: "form__send" },
  X = ["disabled"],
  Y = { key: 0 },
  ee = { key: 1 },
  se = $({
    __name: "FormPasswordDashboard",
    setup(m) {
      const { Swal: u } = N(),
        V = q(),
        x = U(),
        n = f(!1),
        i = f(0),
        _ = f("password"),
        r = f("password"),
        g = f("password"),
        p = () => {
          _.value = _.value === "password" ? "text" : "password";
        },
        a = () => {
          r.value = r.value === "password" ? "text" : "password";
        },
        k = () => {
          g.value = g.value === "password" ? "text" : "password";
        },
        c = D({
          currentPassword: w().required("Contraseña actual es requerida"),
          newPassword: w()
            .min(6, "La contraseña debe tener al menos 6 caracteres")
            .required("Nueva contraseña es requerida"),
          confirmPassword: w()
            .oneOf([O("newPassword")], "Las contraseñas no coinciden")
            .required("Debes repetir la nueva contraseña"),
        }),
        b = f({ currentPassword: "", newPassword: "", confirmPassword: "" }),
        S = async (C) => {
          n.value = !0;
          try {
            (await V(`/users/${x.value.id}`, {
              method: "PUT",
              body: {
                data: {
                  password: C.newPassword,
                  currentPassword: C.currentPassword,
                },
              },
            }),
              (b.value = {
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              }),
              i.value++,
              u.fire("Éxito", "Contraseña cambiada con éxito.", "success"));
          } catch {
            u.fire(
              "Error",
              "Hubo un error al cambiar la contraseña. Verifica tu contraseña actual.",
              "error",
            );
          } finally {
            n.value = !1;
          }
        };
      return (C, l) => (
        t(),
        E(
          o(M),
          { key: i.value, "validation-schema": o(c), onSubmit: S },
          {
            default: h(({ meta: F }) => [
              e("div", H, [
                e("div", j, [
                  l[3] ||
                    (l[3] = e(
                      "label",
                      { class: "form__label", for: "currentPassword" },
                      "Contraseña actual",
                      -1,
                    )),
                  s(
                    o(v),
                    {
                      modelValue: b.value.currentPassword,
                      "onUpdate:modelValue":
                        l[0] || (l[0] = (P) => (b.value.currentPassword = P)),
                      name: "currentPassword",
                      type: _.value,
                      class: "form__control",
                      autocomplete: "current-password",
                    },
                    null,
                    8,
                    ["modelValue", "type"],
                  ),
                  e(
                    "button",
                    {
                      class: "form__group--password__show-password",
                      type: "button",
                      title: "Mostrar/ocultar contraseña",
                      onClick: p,
                    },
                    [
                      _.value !== "password"
                        ? (t(), d("strong", z, "Ocultar"))
                        : (t(), d("strong", G, "Mostrar")),
                    ],
                  ),
                  s(o(y), { name: "currentPassword" }),
                ]),
                e("div", L, [
                  l[4] ||
                    (l[4] = e(
                      "label",
                      { class: "form__label", for: "newPassword" },
                      "Nueva contraseña",
                      -1,
                    )),
                  s(
                    o(v),
                    {
                      modelValue: b.value.newPassword,
                      "onUpdate:modelValue":
                        l[1] || (l[1] = (P) => (b.value.newPassword = P)),
                      name: "newPassword",
                      type: r.value,
                      class: "form__control",
                      autocomplete: "new-password",
                    },
                    null,
                    8,
                    ["modelValue", "type"],
                  ),
                  e(
                    "button",
                    {
                      class: "form__group--password__show-password",
                      type: "button",
                      title: "Mostrar/ocultar contraseña",
                      onClick: a,
                    },
                    [
                      r.value !== "password"
                        ? (t(), d("strong", K, "Ocultar"))
                        : (t(), d("strong", R, "Mostrar")),
                    ],
                  ),
                  s(o(y), { name: "newPassword" }),
                ]),
                e("div", Z, [
                  l[5] ||
                    (l[5] = e(
                      "label",
                      { class: "form__label", for: "confirmPassword" },
                      "Repetir contraseña",
                      -1,
                    )),
                  s(
                    o(v),
                    {
                      modelValue: b.value.confirmPassword,
                      "onUpdate:modelValue":
                        l[2] || (l[2] = (P) => (b.value.confirmPassword = P)),
                      name: "confirmPassword",
                      type: g.value,
                      class: "form__control",
                      autocomplete: "new-password",
                    },
                    null,
                    8,
                    ["modelValue", "type"],
                  ),
                  e(
                    "button",
                    {
                      class: "form__group--password__show-password",
                      type: "button",
                      title: "Mostrar/ocultar contraseña",
                      onClick: k,
                    },
                    [
                      g.value !== "password"
                        ? (t(), d("strong", J, "Ocultar"))
                        : (t(), d("strong", Q, "Mostrar")),
                    ],
                  ),
                  s(o(y), { name: "confirmPassword" }),
                ]),
                e("div", W, [
                  e(
                    "button",
                    {
                      disabled: n.value || !F.valid,
                      type: "submit",
                      class: "btn btn--primary",
                    },
                    [
                      n.value
                        ? (t(), d("span", ee, "Cambiando..."))
                        : (t(), d("span", Y, "Cambiar contraseña")),
                    ],
                    8,
                    X,
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
    },
  }),
  ae = Object.assign(se, { __name: "FormPasswordDashboard" }),
  oe = { class: "form form--profile-edit" },
  re = { class: "form__grid" },
  te = { class: "form__group" },
  ne = { class: "form__group" },
  le = { class: "form__group" },
  de = { class: "form__group" },
  ue = { class: "form__send" },
  ie = ["disabled"],
  me = { key: 0 },
  ce = { key: 1 },
  _e = $({
    __name: "FormEdit",
    setup(m) {
      const { Swal: u } = N(),
        V = q(),
        { fetchUser: x } = A(),
        n = U(),
        i = f(!1),
        _ = D({
          firstname: w().required("Nombre es requerido"),
          lastname: w().required("Apellido es requerido"),
          email: w()
            .email("Correo electrónico no válido")
            .required("Correo electrónico es requerido"),
          username: w().required("Nombre de usuario es requerido"),
        }),
        r = f({
          firstname: n.value?.firstname ?? "",
          lastname: n.value?.lastname ?? "",
          email: n.value?.email ?? "",
          username: n.value?.username ?? "",
        }),
        g = async (p) => {
          i.value = !0;
          try {
            (await V(`/users/${n.value.id}`, {
              method: "PUT",
              body: {
                firstname: p.firstname,
                lastname: p.lastname,
                email: p.email,
                username: p.username,
              },
            }),
              await x(),
              u.fire("Éxito", "Perfil actualizado con éxito.", "success"));
          } catch {
            u.fire("Error", "Hubo un error al guardar el perfil.", "error");
          } finally {
            i.value = !1;
          }
        };
      return (p, a) => (
        t(),
        E(
          o(M),
          { "validation-schema": o(_), onSubmit: g },
          {
            default: h(({ meta: k }) => [
              e("div", oe, [
                e("div", re, [
                  e("div", te, [
                    a[4] ||
                      (a[4] = e(
                        "label",
                        { class: "form__label", for: "firstname" },
                        "Nombre",
                        -1,
                      )),
                    s(
                      o(v),
                      {
                        modelValue: r.value.firstname,
                        "onUpdate:modelValue":
                          a[0] || (a[0] = (c) => (r.value.firstname = c)),
                        name: "firstname",
                        type: "text",
                        class: "form__control",
                        autocomplete: "given-name",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    s(o(y), { name: "firstname" }),
                  ]),
                  e("div", ne, [
                    a[5] ||
                      (a[5] = e(
                        "label",
                        { class: "form__label", for: "lastname" },
                        "Apellido",
                        -1,
                      )),
                    s(
                      o(v),
                      {
                        modelValue: r.value.lastname,
                        "onUpdate:modelValue":
                          a[1] || (a[1] = (c) => (r.value.lastname = c)),
                        name: "lastname",
                        type: "text",
                        class: "form__control",
                        autocomplete: "family-name",
                      },
                      null,
                      8,
                      ["modelValue"],
                    ),
                    s(o(y), { name: "lastname" }),
                  ]),
                ]),
                e("div", le, [
                  a[6] ||
                    (a[6] = e(
                      "label",
                      { class: "form__label", for: "email" },
                      "Correo electrónico",
                      -1,
                    )),
                  s(
                    o(v),
                    {
                      modelValue: r.value.email,
                      "onUpdate:modelValue":
                        a[2] || (a[2] = (c) => (r.value.email = c)),
                      name: "email",
                      type: "email",
                      class: "form__control",
                      autocomplete: "email",
                    },
                    null,
                    8,
                    ["modelValue"],
                  ),
                  s(o(y), { name: "email" }),
                ]),
                e("div", de, [
                  a[7] ||
                    (a[7] = e(
                      "label",
                      { class: "form__label", for: "username" },
                      "Nombre de usuario",
                      -1,
                    )),
                  s(
                    o(v),
                    {
                      modelValue: r.value.username,
                      "onUpdate:modelValue":
                        a[3] || (a[3] = (c) => (r.value.username = c)),
                      name: "username",
                      type: "text",
                      class: "form__control",
                      autocomplete: "username",
                    },
                    null,
                    8,
                    ["modelValue"],
                  ),
                  s(o(y), { name: "username" }),
                ]),
                e("div", ue, [
                  e(
                    "button",
                    {
                      disabled: i.value || !k.valid,
                      type: "submit",
                      class: "btn btn--primary",
                    },
                    [
                      i.value
                        ? (t(), d("span", ce, "Guardando..."))
                        : (t(), d("span", me, "Guardar cambios")),
                    ],
                    8,
                    ie,
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
    },
  }),
  fe = Object.assign(_e, { __name: "FormEdit" }),
  ye = $({
    __name: "profile",
    setup(m) {
      const u = [{ label: "Mi Perfil" }];
      return (V, x) => {
        const n = T,
          i = B,
          _ = ae,
          r = I;
        return (
          t(),
          d("div", null, [
            s(n, { title: "Mi Perfil", breadcrumbs: u }),
            s(r, null, {
              content: h(() => [
                s(
                  i,
                  { title: "Editar perfil", columns: 1 },
                  { default: h(() => [s(fe)]), _: 1 },
                ),
                s(
                  i,
                  { title: "Cambiar contraseña", columns: 1 },
                  { default: h(() => [s(_)]), _: 1 },
                ),
              ]),
              _: 1,
            }),
          ])
        );
      };
    },
  });
export { ye as default };
//# sourceMappingURL=GvqzW_13.js.map
