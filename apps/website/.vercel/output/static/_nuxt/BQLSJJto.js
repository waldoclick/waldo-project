import {
  aZ as y,
  be as I,
  a_ as r,
  a$ as c,
  bG as N,
  bN as D,
  bf as C,
  bn as V,
  bo as w,
  bi as p,
  bO as b,
  b9 as X,
  b8 as f,
} from "./BK8sApmn.js";
try {
  let i =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    l = new i.Error().stack;
  l &&
    ((i._sentryDebugIds = i._sentryDebugIds || {}),
    (i._sentryDebugIds[l] = "8a7e4527-7a12-4e8d-b5a2-7549c4bc756a"),
    (i._sentryDebugIdIdentifier =
      "sentry-dbid-8a7e4527-7a12-4e8d-b5a2-7549c4bc756a"));
} catch {}
const x = [
    { name: "Chile", iso2: "cl", dialCode: "+56" },
    { name: "Argentina", iso2: "ar", dialCode: "+54" },
    { name: "Bolivia", iso2: "bo", dialCode: "+591" },
    { name: "Brazil", iso2: "br", dialCode: "+55" },
    { name: "Canada", iso2: "ca", dialCode: "+1" },
    { name: "China", iso2: "cn", dialCode: "+86" },
    { name: "Colombia", iso2: "co", dialCode: "+57" },
    { name: "Costa Rica", iso2: "cr", dialCode: "+506" },
    { name: "Cuba", iso2: "cu", dialCode: "+53" },
    { name: "Dominican Republic", iso2: "do", dialCode: "+1809" },
    { name: "Ecuador", iso2: "ec", dialCode: "+593" },
    { name: "El Salvador", iso2: "sv", dialCode: "+503" },
    { name: "France", iso2: "fr", dialCode: "+33" },
    { name: "Germany", iso2: "de", dialCode: "+49" },
    { name: "Guatemala", iso2: "gt", dialCode: "+502" },
    { name: "Honduras", iso2: "hn", dialCode: "+504" },
    { name: "Italy", iso2: "it", dialCode: "+39" },
    { name: "Japan", iso2: "jp", dialCode: "+81" },
    { name: "Mexico", iso2: "mx", dialCode: "+52" },
    { name: "Nicaragua", iso2: "ni", dialCode: "+505" },
    { name: "Panama", iso2: "pa", dialCode: "+507" },
    { name: "Paraguay", iso2: "py", dialCode: "+595" },
    { name: "Peru", iso2: "pe", dialCode: "+51" },
    { name: "Spain", iso2: "es", dialCode: "+34" },
    { name: "Trinidad and Tobago", iso2: "tt", dialCode: "+1868" },
    { name: "United Kingdom", iso2: "gb", dialCode: "+44" },
    { name: "United States", iso2: "us", dialCode: "+1" },
    { name: "Uruguay", iso2: "uy", dialCode: "+598" },
    { name: "Venezuela", iso2: "ve", dialCode: "+58" },
  ],
  P = { class: "input input--phone" },
  B = ["value"],
  S = ["value"],
  U = y({
    __name: "InputPhone",
    props: { modelValue: {}, value: {} },
    emits: ["update:modelValue"],
    setup(i, { emit: l }) {
      const s = x,
        h = X(() => {
          const a = s.find((e) => e.iso2 === "cl"),
            o = s
              .filter((e) => e.iso2 !== "cl")
              .sort((e, u) => e.name.localeCompare(u.name));
          return a ? [a, ...o] : o;
        }),
        m = i,
        t = l,
        d = f("+56"),
        n = f("");
      function g(a) {
        if (!a || !a.startsWith("+"))
          return { dialCode: "+56", localNumber: a ?? "" };
        const o = [...s].sort((e, u) => u.dialCode.length - e.dialCode.length);
        for (const e of o)
          if (a.startsWith(e.dialCode))
            return {
              dialCode: e.dialCode,
              localNumber: a.slice(e.dialCode.length),
            };
        return { dialCode: "+56", localNumber: a };
      }
      I(
        () => m.modelValue ?? m.value ?? "",
        (a) => {
          const o = g(a);
          ((d.value = o.dialCode),
            (o.localNumber !== "" || n.value === "") &&
              (n.value = o.localNumber));
          const e = o.dialCode + n.value;
          e !== a && t("update:modelValue", e);
        },
        { immediate: !0 },
      );
      function _(a) {
        const o = a.target,
          e = o.value.replace(/\D/g, "").slice(0, 12);
        ((n.value = e), (o.value = e), t("update:modelValue", d.value + e));
      }
      function v() {
        t("update:modelValue", d.value + n.value);
      }
      return (a, o) => (
        r(),
        c("div", P, [
          N(
            C(
              "select",
              {
                "onUpdate:modelValue": o[0] || (o[0] = (e) => (d.value = e)),
                class: "input--phone__select",
                onChange: b(v, ["stop"]),
              },
              [
                (r(!0),
                c(
                  V,
                  null,
                  w(
                    h.value,
                    (e) => (
                      r(),
                      c(
                        "option",
                        { key: e.iso2, value: e.dialCode },
                        p(e.iso2.toUpperCase()) + " " + p(e.dialCode),
                        9,
                        B,
                      )
                    ),
                  ),
                  128,
                )),
              ],
              544,
            ),
            [[D, d.value]],
          ),
          C(
            "input",
            {
              value: n.value,
              type: "tel",
              class: "input--phone__number",
              placeholder: "9 XXXX XXXX",
              maxlength: "12",
              onInput: b(_, ["stop"]),
            },
            null,
            40,
            S,
          ),
        ])
      );
    },
  }),
  E = Object.assign(U, { __name: "InputPhone" });
export { E as _ };
//# sourceMappingURL=BQLSJJto.js.map
